
function getRandNums(k, n) {
    //if (k>n) throw "k>n";
    var selection = [];
    var sorted = [];
    for (var i = 0; i < k; i++) {
        var rand = Math.floor(Math.random()*(n - i));
        for (var j = 0; j < i; j++) {
          if (sorted[j]<=rand)
            rand++;
        else
            break;
        }
        selection.push(rand);
        sorted.splice(j, 0, rand);
    }
    return selection;
}

/*
 * Add a CSS class to the specified element
 *
 * Takes 2 parameters, the element and the name of the class to add
 */
function addClass(element, classToAdd) {
    var currentClassValue = element.className;
     
    if (currentClassValue.indexOf(classToAdd) == -1) {
        if ((currentClassValue === null) || (currentClassValue === "")) {
            element.className = classToAdd;
        } else {
            element.className += " " + classToAdd;
        }
    }
}

/*
 * Remove a CSS class from the specified element
 *
 * Takes 2 parameters, the element and the name of the class to remove
 */     
function removeClass(element, classToRemove) {
    var currentClassValue = element.className;
     
    // removing a class value when there is more than one class value present
    // and the class you want to remove is not the first one
    if (currentClassValue.indexOf(" " + classToRemove) != -1) {
        element.className = element.className.replace(" " + classToRemove, "");
        return;
    }
     
    // removing the first class value when there is more than one class
    // value present
    if (currentClassValue.indexOf(classToRemove + " ") != -1) {
        element.className = element.className.replace(classToRemove + " ", "");
        return;
    }
     
    // removing the first class value when there is only one class value 
    // present
    if (currentClassValue.indexOf(classToRemove) != -1) {
        element.className = element.className.replace(classToRemove, "");
        return;
    }
}