const he = require('he');

// Función para obtener los elementos de la API de Webflow
async function getWebflowItems(limit, page) {
    const apiKey = '0ccad3ca2af58e662211e1ebe39bccc24a3db2a4bc6ce998430f8bc5c8b8352f';
    const collectionId = '64b0a27430b4c55a1642fd3b';
  
    const apiUrl = `https://api.webflow.com/collections/${collectionId}/items`;
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };
  
    const params = {
      limit: limit,
      offset: (page - 1) * limit,
    };
  
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${apiUrl}?${queryString}`, { headers });
  
    if (!response.ok) {
      throw new Error('Error al obtener los elementos de Webflow.');
    }
  
    const data = await response.json();
    return data;
}

// function extractTitlesFromHTML(html) {
//   // Expresión regular para buscar títulos h1, h2, h3, h4, h5 y h6 en el contenido HTML
//   const regex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/g;

//   const titles = [];
//   let match;
//   while ((match = regex.exec(html)) !== null) {
//     // match[1] contiene el texto del título sin las etiquetas HTML
//     titles.push(match[1]);
//     console.log(match[1]);
//   }

//   return titles;
// }

function containsSpecialCharacters(title) {
  // Expresión regular para buscar caracteres raros en el título
  const regex = /<[a-zA-Z\s"-=]+><\/[a-zA-Z\s"-=]+>/;
  return regex.test(title);
}

function extractTitlesFromHTML(html) {
  // Expresión regular para extraer títulos del contenido HTML
  const regex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/g;
  const titles = [];
  let match;

  while ((match = regex.exec(html))) {
    const title = match[1];
    // Decodificar caracteres HTML especiales en el título
    const decodedTitle = he.decode(title);
    titles.push(decodedTitle);
  }

  return titles;
}

  
async function getAllWebflowItems() {
  const limit = 100;
  let page = 1;
  let allItems = [];
  let items;
  let data;

  try {
    while (allItems.length < 5000) {
      data = await getWebflowItems(limit, page);
      items = data.items;

      if (items.length === 0) {
        // Si no hay más elementos disponibles, salimos del bucle
        break;
      }

      allItems = allItems.concat(items);
      page++;

      for (const item of items) {
        // Obtener los títulos del contenido HTML
        const titles = extractTitlesFromHTML(item['post-body']);
  
        // Verificar si el título contiene caracteres raros
        const containsSpecialChars = titles.some((title) =>
          containsSpecialCharacters(title)
        );
  
        // Si el título contiene caracteres raros, agregamos el post a la lista final
        if (containsSpecialChars) {
          allItems.push(item)

          const namesArray = allItems.map((item) => item.name);
          // const slugArray = items.map((item) => `https://www.freetravelplans.com/post/${item.slug}`);
          const slugArray = `https://www.freetravelplans.com/post/${item.slug}`

          console.log(slugArray)
        }
      }

    }
    // console.log('Total de elementos obtenidos:', allItems.length);
  } catch (error) {
    console.error('Error al obtener los elementos:', error.message);
  }
}
getAllWebflowItems();