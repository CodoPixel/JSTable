/**
 * The parent class of `Cell` & `MainCell`. Do not use it separately.
 */
class PartOfTable {
    /**
     * The cell of a table.
     * @param {string} text The text to be contained in the cell.
     * @param {Array<Object<string>>} options Options you can add to the cell.
     */
    constructor(text, options) {
        this.text = text;

        if (!options) options = {};
        this.rowspan = options.rowspan || 1;
        this.colspan = options.colspan || 1;
        this.scope = options.scope || '';
        this.id = options.id || '';
        this.classname = options.classname || '';
    }

    getText() { return this.text; }
    getRowspan() { return this.rowspan; }
    getColspan() { return this.colspan; }
    getScope() { return this.scope; }
    getID() { return this.id; }
    getClassname() { return this.classname; }
}

/**
 * A future `<td>` (a classic cell) in your generated table.
 */
class Cell extends PartOfTable {
    /**
     * A Cell will be, in HTML, a `<td>`.
     * @param {string} text The text to be contained in the cell.
     * @param {Array<Object<string>>} options Options you can add to the cell.
     */
    constructor(text, options) {
        super(text, options);
    }
}

/**
 * A future `<th>` (a main cell) in your generated table.
 */
class MainCell extends PartOfTable {
    /**
     * A MainCell will be, in HTML, a `<th>`.
     * @param {string} text The text to be contained in the cell.
     * @param {Array<Object<string>>} options Options you can add to the cell.
     */
    constructor(text, options) {
        super(text, options);
    }
}

/**
 * Generates a fake cell in order to the cells to have rowspan & colspan attributes without throwing an Error.
 */
class BreakPointCell {
    constructor() {}
}

/**
 * Thanks to JSTable, you can create a table using Javascript.
 */
class JSTable {
    /**
     * Defines the primary requirements for JSTable to generate a table.
     * @param {string} parent The query selector of the parent in which to put the generated table.
     * @param {string} title The title of the table (`<caption>`).
     * @param {string} titlePos The position of the title (caption-side CSS property): 'bottom' or 'top' (by default).
     * @param {string} orientation The orientation of the table.
     * @param {Array<Array<PartOfTable>>} cells An array that contains all the cells of the table.
     * @param {Array<Object>} attributes An array in which you can define some attributes to add to the generated table.
     */
    constructor({parent, title, titlePos, orientation, cells, attributes}) {
        this.parent = document.querySelector(parent) || document.body;
        this.title = title || '';
        this.titlePos = titlePos || 'top';
        this.cells = cells || [];
        this.attributes = attributes || [];
        this.setOrientation(orientation);
    }

    /**
     * Gets the orientation of the table.
     * @returns {string} The orientation of the table: 'vertical' or 'horizontal'. Horizontal by default.
     */
    getOrientation() { return this.orientation; }

    /**
     * Sets the orientation of the table. 
     * @param {string} orientation
     */
    setOrientation(orientation) {
        if (!orientation) orientation = 'horizontal';
        if (orientation != 'horizontal' && orientation != 'vertical') {
            throw new Error("JSTable: orientation must be 'vertical' or 'horizontal'.");
        }
        this.orientation = orientation;
    }

    /**
     * Generates the `<caption>` of the table.
     */
    _genCaption() {
        var caption = document.createElement('caption');
        caption.innerHTML = this.title || '';
        caption.style.captionSide = this.titlePos;
        return caption;
    }

    /**
     * Generates a `<td>` or a `<th>` to put in the table.
     * @param {PartOfTable} cell A cell to put in the table.
     * @returns {HTMLTableDataCellElement} A new cell for the table.
     */
    _genCell(cell) {
        var htmlCell = document.createElement('td');
        if (cell instanceof MainCell) htmlCell = document.createElement('th');

        htmlCell.innerHTML = cell.getText();
        htmlCell.setAttribute('rowspan', cell.getRowspan());
        htmlCell.setAttribute('colspan', cell.getColspan());
        htmlCell.setAttribute('scope', cell.getScope());
        htmlCell.setAttribute('id', cell.getID());
        if (cell.getClassname()) {
            var classes = cell.getClassname().split(' ');
            classes.forEach(function(clas) {
                htmlCell.classList.add(clas);
            });
        }
        return htmlCell;
    }

    /**
     * We pretend that the painting is vertical while we build it horizontally.
     * @returns {Array<Array<PartOfTable>>} An array of arrays of cells.
     */
    _reorganizeCellsForVerticalTable() {
        var numberOfColumns = this.cells.length;
        var numberOfLines = this.cells[0].length; // every line must have the same number of cells.

        // destructure the input
        var newArrayOfCells = []; // [[0, 0], [1, 1], [2, 2], [3, 3]]
        for (var i = 0; i < numberOfLines; i++) {
            newArrayOfCells[i] = [];
            for (var e = 0; e < numberOfColumns; e++) {
                newArrayOfCells[i][e] = this.cells[e][i];
            } 
        }

        return newArrayOfCells;
    }

    /**
     * Generates the table according to its orientation.
     * @param {string} orientation The orientation of the table.
     */
    generate(orientation) {
        if (!orientation) {
            orientation = this.orientation;
        }

        var table = document.createElement('table');
        var caption = this._genCaption();
        table.appendChild(caption);

        if (this.attributes) {
            this.attributes.forEach(function(attr) {
                table.setAttribute(attr.name, attr.value);
            });
        }

        var cells = this.cells;
        if (orientation === "vertical") cells = this._reorganizeCellsForVerticalTable();

        for (var line of cells) {
            var tr = document.createElement('tr');
            for (var cell of line) {
                if (cell instanceof BreakPointCell) continue;
                tr.appendChild(this._genCell(cell));
            }
            table.appendChild(tr);
        }

        this.parent.appendChild(table);
    }
}