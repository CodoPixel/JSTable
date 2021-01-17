# JSTable

Creates a table using Javascript.

## Get started

First of all, you need to add the source code to your HTML page:

```
<script src="JSTable.js"></script>
```

Now, you can create a new `JSTable()` which takes a lot of arguments in a single object:

```
var table = new JSTable({
    orientation: 'horizontal', // 'vertical' or 'horizontal', 'horizontal' is the default value
    parent: '#container', // the query selector of the parent, by default: document.body
    title: 'A weird test', // the title of the table
    titlePos: 'top', // the position of the title: 'top' by default, or 'bottom'
    cells: // the cells to put inside the table
    [
        // each array inside `cells` is a line of your table
        [
            new Cell(""), // an empty cell in the upper left corner
            new MainCell("Age"), // a main cell (<th>)
            new MainCell("City"),
            new MainCell("Sex")
        ],
        [
            new MainCell("Thomas"),
            new Cell("17 ans"),
            new Cell("No data"),
            new Cell("Male"),
        ],
        [
            new MainCell("Sarah"),
            new Cell("17 ans"),
            new Cell("No data"),
            new Cell("Female"),
        ]
    ],
    attributes: [{name: 'class', value: 'tables'}] // attributes for <table>, by default: []
});
```

Generate the table with the method `generate(orientation?: string)`:

```
table.generate();
```

This will generate a table inside the given parent element.

## The arguments for JSTable

JSTable takes only one argument: an object. However, inside this object, you can put some options...Here is a summary:

|Name|Type|Default value|description|
|parent|string|document.body|The query selector of the parent in which to put the generated table.|
|title|string|_empty string_|The title of the table (`<caption>`)|
|titlePos|string|'top'|The position of the title (caption-side CSS property): 'bottom' or 'top'.|
|orientation|string|'horizontal'|The orientation of the table: 'vertical' or 'horizontal'.|
|cells|`Array<Array<PartOfTable>>`|_empty array_|An array that contains all the cells of the table.|
|attributes|`Array<Object>`|_empty array_|An array in which you can define some attributes to add to the generated table.|

To go further, you also have some methods from JSTable:

+ `getOrientation()`: gets the orientation of the table.
+ `setOrientation()`: Sets the orientation of the table: 'vertical' or 'horizontal'.
+ `generate(orientation?: string)`: generates the table according to the orientation. If you set an orientation using this method, then this orientation will be chosen rather than the default one given via JSTable instantiation.

The first two methods are there, but you should not have to use them.

## More complex tables

You have two types of cells, which extend from `PartOfTable`:

+ `Cell(text: string, options?: {})`: a basic cell (`<td>`)
+ `MainCell(text: string, options?: {})`: a main cell (`<th>`)

To each cell, you can add specific options:

|Name|Type|Default value|description|
|----|----|-------------|-----------|
|rowspan|int|1|rowspan attribute|
|colspan|int|1|colspan attribute|
|scope|string|_empty string_|scope attribute|
|id|string|_empty string_|id attribute|
|classname|string|_empty string_|The classes of the cell. Separate the classes with spaces: 'class1 class2 class3'|

From each cell, you have some basic methods:

+ `getText()`: get the text contained in the cell.
+ `getRowspan()`: get the value of the rowspan attribute.
+ `getColspan()`: get the value of the colspan attribute.
+ `getScope()`: get the value of the scope attribute.
+ `getID()`: get the ID of the cell.
+ `getClassname()`: get the className attribute.