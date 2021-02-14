# JSTable

A complete tool to make the most of HTML tables in Javascript.

## Get Started

The source code is available in TypeScript & JavaScript in the `src` folder. Copy the source code and implement it in your project:

```
<script src="jstable.js"></script>
```

Now, you can use JSTable!

## How to create a table ?

First of all, let's create a javascript array:

```
var jsArray = [
    ["Last name", "First name", "Age"],
    ["Hawking", "Stephen", "76"],
    ["Einstein", "Albert", "76"]
];
```

Now that our JavaScript table is ready, we want to generate the corresponding HTML table:

```
// create an instance of JSTable
var jstable = new JSTable();

// create a HTML table from the javascript array
// "Example" is the title (caption) of the table
// "bottom" is the position of the title (caption-side property)
var htmlArray = jstable.jsArrayToHtml(jsArray, "Example", "bottom");

// to generate a HTML table, you can specify a container in which to put the table
// by default, the container is 'document.body'
var container = document.getElementById('container');

// use the 'generate' property from JSTable
jstable.generate(htmlArray, container);
```

## Advanced feature: Identifiers

As you can see, "76" is repeated two times, so maybe we could use the 'rowspan' property? To do such things, there are 3 `identifiers`:

+ `@`: placed at the beginning of the string is used to define a cell as a main cell (`th`).
+ `.c*2`: placed at the end of the string, this symbol is used to define the rowspan property. By default, all cells have a rowspan property set to 1.
+ `.r*2`: placed at the end of the string, this symbol is used to define the colspan property. By default, all cells have a colspan property set to 1.

Therefore, let's create a more sophisticated array:

```
var jsArray = [
    ["@Last name", "@First name", "@Age"], // <th>
    ["Hawking", "Stephen", "76.c*2"], // change "2" to whatever you want according to your needs
    ["Aucune donnée.r*2", ".", "."] // use a single "." to skip a cell during its creation
];
```

Technically speaking, the last line has only one cell.

## Advanced feature: Custom Functions

You can add custom functions that are executed during the creation of the HTML table. By default, there are no custom functions. However, you can add one. Let's create a custom function that returns a random int.

```
var jstable = new JSTable();
jstable.addCustomFunction({
    name: 'Random', // name of the custom function
    callback: (args) => { // during the creation of a cell, its value will be replaced by the return value of 'callback'
        min = Math.ceil(parseInt(args[0]));
        max = Math.floor(parseInt(args[1]));
        return Math.floor(Math.random() * (max - min)) + min;
    },
    events: [
        ['click', (e) => console.info(e)] // === addEventListener('click', (e) => console.info(e))
    ],
    attributes: [
        ['class', 'random'] // sets the attribute 'class' to 'random'
    ]
});
```

How do we use that feature?

```
var jsArray = [
    ["@Last name", "@First name", "@Age"],
    ["Hawking", "Stephen", "<Random(0, 77)>.c*2"],
    ["Aucune donnée.r*2", ".", "."]
];
```

In this example, the cells containing `<Random(...args)>` will generate a random number (depending on the callback function). Besides, we add to this same cell a "random" class and an event listener.

NB: Every custom function don't necessarly need a callback function, events listeners or attributes.

## Advanced feature: Sequences

