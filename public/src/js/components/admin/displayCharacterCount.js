function displayCharacterCount(trackedElements) {
  console.log('displayCharacterCount invoked');
  trackedElements.forEach(element => {
    element.addEventListener('input', function () {
      const totalChars = this.value.length;
      const idAttr = this.getAttribute('id');
      const outputElem = document.querySelector(`.charsCount.${idAttr}`);
      if (outputElem) outputElem.textContent = totalChars;
    });
  });
}

export { displayCharacterCount };
