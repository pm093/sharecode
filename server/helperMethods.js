const helperMethods = {
 contains: (array,value) => {
    var result = false;
    array.forEach((v) => {
      if (v==value) {
        result = true;
      }
    })
    return result;
  }
}

export default helperMethods;
