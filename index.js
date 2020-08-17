const $textArea = document.querySelector(".html__field");
const $output = document.querySelector('.output');

const addOnFakeHTML = (text) => {
  const $fake = document.querySelector(".fake");

  $fake.innerHTML = text;

  return $fake;
};

const organizeClassList = (elementList) => {
  const arrayOfElementList = [...elementList];

  const classList = arrayOfElementList.reduce((acc, element) => {
    const elementClassList = element.classList;

    return [...acc, ...elementClassList];
  }, []);

  const recursiveClassList = (className, mainClass, obj) => {
    const [firstClass, ...restClass] = className.split("-");

    const object = obj
      ? obj
      : {
          mainClass,
          children: [],
        };

    const newChildren = {
      mainClass: firstClass,
      children: [],
    };

    className && (object.mainClass = firstClass);
    className && object.children.push(newChildren);

    if (className) recursiveClassList(restClass.join("-"), firstClass, newChildren);

    return object;
  };

  const formatedClassList = classList.map((className) => {
    const [firstClass, ...rest] = className.split("__");

    const props = recursiveClassList(rest.join("-"), firstClass);

    return { mainClass: firstClass, children: props };
  });

  const joinMainClass = (array) => {
    const childrenList = [];
    array.map((item) => {
      const index = childrenList.findIndex((indexItem) => indexItem.mainClass === item.mainClass);

      if (index === -1) return childrenList.push(item);

      childrenList[index].children.push(item.children[0]);
    });
    return childrenList;
  };

  const joinedClassList = [];

  formatedClassList.map((item) => {
    const index = joinedClassList.findIndex((indexItem) => item.mainClass === indexItem.mainClass);

    if (index === -1) return joinedClassList.push(item);

    joinedClassList[index].children.children.push(item.children);
  });

  joinedClassList.map((item) => {
    const joinedChildren = joinMainClass(item.children.children);

    item.children = joinedChildren;
  });
  return joinedClassList;
};

$textArea.addEventListener("change", (e) => {
  const value = e.target.value;
  const $fakeHtml = addOnFakeHTML(value);

  const $allElements = $fakeHtml.querySelectorAll("*");

  const organizedList = organizeClassList($allElements);

  $output.textContent = createSass(organizedList);
});

const createSass = (array) => {
  let string = ''
  array.map((item) => {
    string += createString(item.mainClass, item.children, true);
  });

  return string;
};

const createString = (principalClass, children) => {
  const createChildrenSass = (children, otherChildren) => {
    let string = "";

    children.map((item, index ) => {
      if (index === 0 && otherChildren) return;
      if (!item) return;
      if (item.mainClass === '') return
      const prefix = otherChildren ? "-" : '__';
      string += `&${prefix}${item.mainClass}{
        ${item.children ? createChildrenSass(item.children, true) : ''}
      }`;
    });

    return string;
  };

  return `.${principalClass}{
      ${children[0] ? createChildrenSass(children) : ""}
  }`;
};
