interface Pos {
    x?: number,
    y?: number
};

interface ComplexPos {
    x1?: number,
    y1?: number,
    x2?: number,
    y2?: number
}

class Cell {
    private x:number;
    private y:number;
    private element:HTMLTableDataCellElement;
    private table:HTMLTableElement;
    private container:HTMLElement;
    private attributes:string[][];

    constructor(x:number, y:number, element:HTMLTableDataCellElement, table:HTMLTableElement) {
        this.x = x;
        this.y = y;
        this.element = element;
        this.table = table;
        this.container = this.table.parentElement;
        
        try {
            for (var i = 0; i < this.element.getAttributeNames().length; i++) {
                var name:string = this.element.getAttributeNames()[i];
                var value:string = this.element.getAttribute(name);
                this.attributes.push([name, value]);
            }
        } catch(e) {
            throw new Error("An error has occured while trying to create a cell from a HTML element.");
        }
    }

    getPos(): Pos { return {x:this.x, y:this.y}; }
    getElement(): HTMLTableDataCellElement { return this.element; }
    getTable(): HTMLTableElement { return this.table; }
    getContainer(): HTMLElement { return this.container; }
    getAttributes(): string[][] { return this.attributes; }

    clearContent(): void { this.element.textContent = ""; }
}

class JSTable {
    private commonClass:string;
    private regexColspan:RegExp = /\.r\*(\d{1,})/;
    private regexRowspan:RegExp = /\.c\*(\d{1,})/;
    private regexMultipleSelector:RegExp = /#(\d{1,}-\d{1,}:\d{1,}-\d{1,})|#(\d{1,}-\d{1,})/g;

    constructor(commonClass:string) {
        this.commonClass = commonClass;
    }

    public setCommonClass(commonClass:string):void { this.commonClass = commonClass; }

    public doesExist(x:number, y:number, table:HTMLTableElement): boolean {
        try {
            var cell = table.rows[y].childNodes[x];
            return cell !== undefined;
        } catch(e) {
            return false;
        }
    }

    public getNumberOfCellsPerRow(table: HTMLTableElement): number {
        var max = 0;
        var rows = Array.from(table.rows);
        for (var line of rows) {
            var n = line.children.length;
            if (n > max) max = n;
        }
        return max;
    }

    public selectCell(x:number, y:number, table:HTMLTableElement): Cell {
        try {
            var cell = table.rows[y].children[x];
            return cell === undefined ? undefined : new Cell(x, y, (cell as HTMLTableDataCellElement), table);
        } catch(e) {
            return undefined;
        }
    }

    public selectRow(y:number, table:HTMLTableElement): Cell[] {
        var cells: Cell[] = [];
        var row = table.rows[y];
        for (var x = 0; x < row.childElementCount; x++) {
            cells.push(new Cell(x, y, (row.children[x] as HTMLTableDataCellElement), table));
        }

        return cells;
    }

    public selectSeveralRows(y1:number, y2:number, table:HTMLTableElement): Cell[][] {
        var i:number = 0;
        var isReversed:boolean = y1 > y2;
        if (isReversed) {
            [y1, y2] = [y2, y1];
        }

        var cells = [];
        for (i = y1; i <= y2; i++) {
            cells.push(this.selectRow(i, table));
        }

        if (isReversed) {
            for (i = 0; i < cells.length; i++) cells[i].reverse();
            return cells.reverse();
        } else {
            return cells;
        }
    }

    public selectColumn(x:number, table:HTMLTableElement): Cell[] {
        var cells: Cell[] = [];
        for (var y = 0; y < table.rows.length; y++) {
            var cell = (table.rows[y].children[x] as HTMLTableCellElement);
            cells.push(new Cell(x, y, cell, table));
        }

        return cells;
    }

    public selectSeveralColumns(x1: number, x2: number, table: HTMLTableElement): Cell[][] {
        var i:number = 0;
        var isReversed:boolean = x1 > x2;
        if (isReversed) {
            [x1, x2] = [x2, x1];
        }

        var cells = [];
        for (i = x1; i <= x2; i++) {
            cells.push(this.selectColumn(i, table));
        }

        if (isReversed) {
            for (i = 0; i < cells.length; i++) cells[i].reverse();
            return cells.reverse();
        } else {
            return cells;
        }
    }

    public selectMultipleCells(from: Pos, to: Pos, table: HTMLTableElement): Cell[] {
        var i:number = 0;
        var cells: Cell[] = [];

        if (from.y === undefined) from.y = 0;
        if (from.x === undefined) from.x = 0;
        if (to.y === undefined) to.y = 0;
        if (to.x === undefined) to.x = 0;

        // if y1 > y2 => must reverse OR if y1 == y2 AND x1 > x2 => must reverse
        var isReversed:boolean = (from.y > to.y) || (from.y === to.y && from.x > to.x);
        if (isReversed) {
            [from.x, to.x, from.y, to.y] = [to.x, from.x, to.y, from.y];
        }

        // selection
        if (from.y === to.y) {
            var row: HTMLTableRowElement = table.rows[from.y];
            if (row) {
                if (to.x >= row.childElementCount) to.x = row.childElementCount - 1;
                for (i = from.x; i <= to.x; i++) {
                    var el = (row.children[i] as HTMLTableDataCellElement);
                    cells.push(new Cell(i, from.y, el, table));
                }
            } else {
                return cells;
            }
        } else if (from.y < to.y) {
            while (!(from.y > to.y)) {
                var row: HTMLTableRowElement = table.rows[from.y];
                if (row) {
                    var endingPoint = to.x;
                    if (from.y === to.y) {
                        // if this is the last line,
                        // then we have to stop to x2
                        // however, if x2 >= number of cells, then we select every cell of that row again
                        if (to.x >= row.childElementCount) endingPoint = row.childElementCount - 1;
                    } else {
                        // if this is not the last line,
                        // then we select every cell of that row
                        endingPoint = row.childElementCount - 1;
                    }
                    for (i = from.x; i <= endingPoint; i++) {
                        var el = (row.children[i] as HTMLTableDataCellElement);
                        cells.push(new Cell(i, from.y, el, table));
                    }
                    from.y++;
                } else {
                    break;
                }
            }
        }

        return isReversed ? cells.reverse() : cells;
    }

    public translate(cell: HTMLTableDataCellElement): Cell {
        var row = cell.parentElement;
        var table = row.parentElement;
        if (table instanceof HTMLTableSectionElement) table = row.parentElement.parentElement;

        var x = 0;
        var y = 0;

        for (var td of Array.from(row.children)) {
            if (td === cell) {
                break;
            }
            x++;
        }

        for (var tr of Array.from(table.children)) {
            if (tr === row) {
                break;
            }
            y++;
        }

        return new Cell(x, y, cell, (table as HTMLTableElement));
    }

    public isCell(cell: any): boolean {
        return cell instanceof Cell;
    }

    public deleteTable(table: HTMLTableElement): void {
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        table.style.display = "none";
    }

    public removeColumn(x:number, table:HTMLTableElement): boolean {
        for (var y = 0; y < table.rows.length; y++) {
            try {
                table.rows[y].deleteCell(x);
            } catch(e) {
                return false;
            }
        }

        return true;
    }

    public removeRow(y: number, table:HTMLTableElement): boolean {
        try {
            table.deleteRow(y);
            return true;
        } catch(e) {
            return false;
        }
    }

    public removeCellAt(x:number, y:number, table:HTMLTableElement): boolean {
        try {
            table.rows[y].deleteCell(x);
            return true;
        } catch(e) {
            return false;
        }
    }

    public removeCell(cell: Cell) {
        var element = cell.getElement();
        element.parentElement.removeChild(element);
    }

    private _getArgumentsFrom(name: string, text: string): string[] {
        var regex = new RegExp('<' + name + '\((.*)\)>', 'gmi');
        text = text.replace(', ', ',');
        text.replace(regex, '$1');
        return RegExp.$1.replace(/\(|\)/gm, '').split(',');
    }

    private _getColspanIdentifierFrom(text:string): number {
        var colspan = 1;
        if (this.regexColspan.test(text) === true) {
            text.replace(this.regexColspan, '$1');
            colspan = parseInt(RegExp.$1);
        }

        return colspan;
    }

    private _getRowspanIdentifierFrom(text:string): number {
        var rowspan = 1;
        if (this.regexRowspan.test(text) === true) {
            text.replace(this.regexRowspan, '$1');
            rowspan = parseInt(RegExp.$1);
        }

        return rowspan;
    }

    private _clearAllIdentifiersFrom(text:string): string {
        text = text.replace(this.regexColspan, '');
        text = text.replace(this.regexRowspan, '');
        return text;
    }

    public createCell(text: string, colspan:number, rowspan:number): HTMLTableDataCellElement {
        var cell = document.createElement('td');

        if (this.commonClass) cell.classList.add(this.commonClass);
        cell.setAttribute('colspan', colspan.toString());
        cell.setAttribute('rowspan', rowspan.toString());
        cell.appendChild(document.createTextNode(text));

        return cell;
    }

    public addColumn(column: string[], table: HTMLTableElement, index:number = -1): void {
        for (var y = 0; y < column.length; y++) {
            var text = column[y];
            if (text === ".") continue;

            var colspan = this._getColspanIdentifierFrom(text);
            var rowspan = this._getRowspanIdentifierFrom(text);
            if (colspan > 1 || rowspan > 1) text = this._clearAllIdentifiersFrom(text);

            var newCell = this.createCell(text, colspan, rowspan);
            if (index === -1) {
                table.rows[y].appendChild(newCell);
            } else {
                table.rows[y].insertBefore(newCell, table.rows[y].children[index]); // if ref undefined => index=-1
            }
        }
    }

    public addRow(row: string[], table: HTMLTableElement, index:number = -1): void {
        var newRow = table.insertRow(index);
        for (var x = 0; x < row.length; x++) {
            var text = row[x];
            if (text === ".") continue;

            var colspan = this._getColspanIdentifierFrom(text);
            var rowspan = this._getRowspanIdentifierFrom(text);
            if (colspan > 1 || rowspan > 1) text = this._clearAllIdentifiersFrom(text);

            var newCell = this.createCell(text, colspan, rowspan);
            newRow.appendChild(newCell);
        }
    }

    isMultipleSelector(selector:string): boolean {
        return this.regexMultipleSelector.test(selector);
    }

    readMultipleSelector(selector: string) {
        var matches = selector.match(/(\d{1,})/g);
        var y1 = parseInt(matches[0]),
            x1 = parseInt(matches[1]),
            y2 = parseInt(matches[2]),
            x2 = parseInt(matches[3]);
        return {
            y1:y1,
            x1:x1,
            y2:y2,
            x2:x2
        };
    }
}