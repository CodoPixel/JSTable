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
    parent: '#container', // the query selector of the parent
    title: 'A weird test', // the title of the table
    titlePos: 'top', // the position of the title
    cells: // the cells to put inside the table
    [
        [
            new Cell(""), // an empty cell
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
    ]
});
```

Generate the table with the method `generate(orientation: string)`:

```
table.generate();
```

This will generate a table inside the given parent element.