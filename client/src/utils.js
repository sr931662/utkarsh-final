// export const getImageUrl = (path) => {
//     return new URL(`./assets/${path}`, import.meta.url).href;
// }; 

export const getImageUrl = (path) => {
    // If the path is already an absolute URL, return it as is
    if (path.startsWith('http')) {
      return path;
    }
  
    // Construct the absolute URL based on the root directory and the relative path
    const assetPath = new URL(`./assets/${path}`, import.meta.url).href;
  
    // Handle specific framework or build tool logic here (if necessary)
    // For example, in Vite, you might need to adjust the asset path based on the build configuration
  
    return assetPath;
  };