const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const csv = require("csv-parser");
const MarkdownIt = require("markdown-it");
const attrsPlugin = require("markdown-it-attrs");

const md = new MarkdownIt();

// Define your Webflow API key and headers
const api_key = "0ccad3ca2af58e662211e1ebe39bccc24a3db2a4bc6ce998430f8bc5c8b8352f";
const headers = {
  Authorization: `Bearer ${api_key}`,
  "accept-version": "1.0.0",
  "Content-Type": "application/json",
};

// Define the URL for the CMS items (replace 'site_id' and 'collection_id' with your actual values)
const url = "https://api.webflow.com/collections/64b0a27430b4c55a1642fd3b/items";

let counter = 0;
let sumPost = 0;

fs.createReadStream("./1001-5000_top_cities_list.csv")
  .pipe(csv())
  .on("data", (row) => {
    if (counter <= 99999999999999999999999) {
      // Split the output into separate posts
      const posts = row.output.split("\n# ");

      posts.forEach((post) => {
        // Prepend the '#' to the post content, except for the first one
        if (post !== posts[0]) {
          post = "# " + post;
        }

        // Convert markdown content to HTML
        const htmlContent = md.render(post);
        // Extract the title and meta description
        const title = post.split("\n")[0].replace("# ", ""); // Extracts the first line (title) and removes the '#' character
        const metaDescription = post.split("\n")[1]; // Extracts the first sentence (meta description)
        const modifiedHtmlContent = htmlContent.replace(/\n/g, "<br>");

        // Convert HTML string to a DOM object
        const dom = new JSDOM(htmlContent);
        const imageElement = dom.window.document.querySelectorAll("img");
        const imageUrl = imageElement ? imageElement.src : "";

        // Generate a slug from the title
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Create an object for your blog post
        const blogPost = {
          fields: {
            "_draft": false,
            "_archived": false,
            "name": title,
            "post-body": modifiedHtmlContent,
            "slug": slug,
          },
        };

        // Make a POST request to create the blog post with a delay
        if (!imageUrl) {
          setTimeout(() => {
            axios
              .post(url, blogPost, { headers: headers })
              .then((response) => console.log('status:', response.status, 'Post idx:', sumPost++))
              .catch((error) => {
                console.log(error.response.data);
              });
          }, counter * 1000);

          counter++;
        }
      });
    }
  });
