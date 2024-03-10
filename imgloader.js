let customImages = [];

export function loadCustomImages() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/custompuzzles", true);
  xhr.responseType = 'document';
  xhr.onload = () => {
    customImages = [];
    if (xhr.status === 200) {
      var elements = xhr.response.getElementsByTagName("a");
      for (const x of elements) {
        if (x.href.match(/\.(jpe?g|png|webp)$/i) ) {
            customImages.push(x.href);
        } 
      };
    }
    else {
      alert('Fetching custom puzzles failed. Returned status of ' + xhr.status);
    }
    console.log(customImages)
  }
  xhr.send()
}

export function getRandomCustomImage() {
  return customImages.length === 0 ? "" : customImages[Math.floor(Math.random()*customImages.length)];
}