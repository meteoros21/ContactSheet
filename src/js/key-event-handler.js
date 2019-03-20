function keydownHandler(event)
{
    var sheetInfo2 = mySheetInfo;
    var target = $(event.target);
    var targetId = target.attr('id');

    if (target.attr('editing') != 'true')
    {
        keyDownHandlerForSheet(event);
    }
    else
    {
        if (event.keyCode == 9 || (targetId == 'cell-input' && event.keyCode == 13)) // enter
        {
        	event.preventDefault();
        	var col = sheetInfo2.currentCell.col; 
        	var row = sheetInfo2.currentCell.row;
            
        	sheetInfo2.tableHandler.stopEditing();

        	if (col < sheetInfo2.getColumnCount() - 1)
        		sheetInfo2.tableHandler.setCurrentCell(col + 1, row);
        	else if (row < sheetInfo2.getRowCount() - 1)
        		sheetInfo2.tableHandler.setCurrentCell(0, row + 1);
        }
        else if (event.keyCode == 27)
        {
            event.preventDefault();
            sheetInfo2.tableHandler.cancelEditing();
        }
    }
}

function keyDownHandlerForSheet(event)
{
    var sheetInfo2 = mySheetInfo;

    if (event.keyCode == 9) // tap
    {
        event.preventDefault();
							
        sheetInfo2.tableHandler.stopEditing();

        var col = sheetInfo2.currentCell.col;
        var row = sheetInfo2.currentCell.row;

        if (event.shiftKey == false)
        {
            if (col < sheetInfo2.getColumnCount() - 1)
            {
                sheetInfo2.tableHandler.setCurrentCell(col+1, row);
            }
            else
            {
                if (row < sheetInfo2.tableCell[0].rows.length - 1)
                    sheetInfo2.tableHandler.setCurrentCell(0, row+1);
            }
        }
        else
        {
            if (col > 0)
            {
                sheetInfo2.tableHandler.setCurrentCell(col-1, row);
            }
            else
            {
                if (row > 0)
                    sheetInfo2.tableHandler.setCurrentCell(sheetInfo2.getColumnCount()-1, row-1);
            }
        }
    }
    else if (event.keyCode == 13)
    {
        if ($('.group-menu-wrap').css('display') != 'none')
        {
            event.preventDefault();
            sheetInfo2.tableHandler.stopEditing();
        }
        else
        {
            event.preventDefault();
            sheetInfo2.tableHandler.startEditing();
        }
    }
    else if (event.keyCode == 27)
    {
        if ($('.group-menu-wrap').css('display') != 'none')
        {
            event.preventDefault();
            sheetInfo2.tableHandler.cancelEditing();
        }
        else
        {
            sheetInfo2.tableHandler.unselectRows();
            sheetInfo2.tableHandler.unselectCells();
        }
    }
    else if (event.keyCode == 37) // left
    {
        event.preventDefault();
        sheetInfo2.tableHandler.unselectRows();

        var oldCol = sheetInfo2.currentCell.col;
        var newCol = 0;
        var newRow = sheetInfo2.currentCell.row;

        if (event.shiftKey && sheetInfo2.colForSel >= 0)
        {
            oldCol = sheetInfo2.colForSel;
            newRow = sheetInfo2.rowForSel;
        }

        if (event.metaKey)
            newCol = 0;
        else
            newCol = (oldCol > 0) ? oldCol - 1 : 0;

        if (event.shiftKey)
        {
            sheetInfo2.tableHandler.selectCells(newCol, newRow);
            sheetInfo2.tableHandler.checkScroll(newCol, newRow);
        }
        else
        {
            sheetInfo2.tableHandler.unselectCells();
            sheetInfo2.tableHandler.setCurrentCell(newCol, newRow);
        }
    }
    else if (event.keyCode == 38) // up
    {
        if ($('.group-menu-wrap').css('display') != 'none')
        {
            event.preventDefault();
            sheetInfo2.groupMenu.moveUp();
        }
        else
        {
            event.preventDefault();
            sheetInfo2.tableHandler.unselectRows();

            var oldCol = sheetInfo2.currentCell.col;
            var oldRow = sheetInfo2.currentCell.row;
            var newRow = 0;

            if (event.shiftKey)
            {
                if (sheetInfo2.colForSel >= 0)
                {
                    oldCol = sheetInfo2.colForSel;
                    oldRow = sheetInfo2.rowForSel;
                }
            }

            if (event.metaKey == true)
            {
                if (event.ctrlKey == true)
                {
                    newRow = 0;
                }
                else
                {
                    var rowCnt = Math.round(sheetInfo2.tableCell.parent().outerHeight() / parseInt(sheetInfo2.defaultRowHeight));
                    var newRow = oldRow - rowCnt;

                    if (newRow < 0)
                        newRow = 0;
                }
            }
            else
            {
                newRow = (oldRow > 0) ? oldRow-1 : 0;
            }

            if (event.shiftKey)
            {
                sheetInfo2.tableHandler.selectCells(oldCol, newRow);
                sheetInfo2.tableHandler.checkScroll(oldCol, newRow);
            }
            else
            {
                sheetInfo2.tableHandler.unselectCells();
                sheetInfo2.tableHandler.setCurrentCell(oldCol, newRow);
            }
        }
    }
    else if (event.keyCode == 39) // right
    {
        event.preventDefault();
        sheetInfo2.tableHandler.unselectRows();

        var oldCol = sheetInfo2.currentCell.col;
        var newCol = 0;
        var newRow = sheetInfo2.currentCell.row;

        if (event.shiftKey && sheetInfo2.colForSel >= 0)
        {
            oldCol = sheetInfo2.colForSel;
            newRow = sheetInfo2.rowForSel;
        }

        if (event.metaKey == true)
        {
            var newCol = sheetInfo2.getColumnCount() - 1;
        }
        else
        {
            var newCol = (oldCol < sheetInfo2.getColumnCount() - 2) ? oldCol + 1 : sheetInfo2.getColumnCount()-1;
        }

        if (event.shiftKey)
        {
            sheetInfo2.tableHandler.selectCells(newCol, newRow);
            sheetInfo2.tableHandler.checkScroll(newCol, newRow);
        }
        else
        {
            sheetInfo2.tableHandler.unselectCells();
            sheetInfo2.tableHandler.setCurrentCell(newCol, newRow);
        }
    }
    else if (event.keyCode == 40) // down
    {
        if ($('.group-menu-wrap').css('display') != 'none')
        {
            event.preventDefault();
            sheetInfo2.groupMenu.moveDown();
        }
        else
        {
            event.preventDefault();
            sheetInfo2.tableHandler.unselectRows();

            var oldRow = sheetInfo2.currentCell.row;
            var newCol = sheetInfo2.currentCell.col;
            var newRow = 0;

            if (event.shiftKey)
            {
                if (sheetInfo2.colForSel >= 0)
                {
                    oldRow = sheetInfo2.rowForSel;
                    newCol = sheetInfo2.colForSel;
                }
            }

            if (event.metaKey == true)
            {
                if (event.ctrlKey == true)
                {
                    newRow = sheetInfo2.tableCell[0].rows.length-1;
                }
                else
                {
                    var rowCnt = Math.round(sheetInfo2.tableCell.parent().outerHeight() / parseInt(sheetInfo2.defaultRowHeight));

                    newRow = oldRow + rowCnt;
                    if (newRow > sheetInfo2.tableCell[0].rows.length-1)
                        newRow = sheetInfo2.tableCell[0].rows.length-1
                }
            }
            else
            {
                if (oldRow < sheetInfo2.tableCell[0].rows.length-1)
                    newRow = oldRow+1;
            }

            if (event.shiftKey)
            {
                sheetInfo2.tableHandler.selectCells(newCol, newRow);
                sheetInfo2.tableHandler.checkScroll(newCol, newRow);
            }
            else
            {
                sheetInfo2.tableHandler.unselectRows();
                sheetInfo2.tableHandler.setCurrentCell(newCol, newRow);
            }
        }
    }
    else if (event.keyCode == 32) // space
    {
        if ($('.group-menu-wrap').css('display') != 'none')
        {
            event.preventDefault();
            sheetInfo2.groupMenu.toggleSelection();
        }
    }
    else if (event.keyCode == 36) // home
    {
        sheetInfo2.tableHandler.unselectRows();
        event.preventDefault();
        if (event.ctrlKey)
        {
            var col = sheetInfo2.currentCell.col;
            sheetInfo2.tableHandler.setCurrentCell(col, 0);
        }
        else
        {
            var row = sheetInfo2.currentCell.row;
            var col = 0;
            sheetInfo2.tableHandler.setCurrentCell(col, row);
        }
    }
    else if (event.keyCode == 35) // end
    {
        sheetInfo2.tableHandler.unselectRows();
        event.preventDefault();
        if (event.ctrlKey)
        {
            var col = sheetInfo2.currentCell.col;
            var row = sheetInfo2.tableCell[0].rows.length-1;
            sheetInfo2.tableHandler.setCurrentCell(col, row);
        }
        else
        {
            var row = sheetInfo2.currentCell.row;
            var col = sheetInfo2.getColumnCount() - 1;
            sheetInfo2.tableHandler.setCurrentCell(col, row);
        }
    }
    else if (event.keyCode == 46 || event.keyCode == 8) // delete
    {
        event.preventDefault();

        if (sheetInfo2.selectedRows != null && sheetInfo2.selectedRows.length > 0)
        {
            showWaitScreen().then(function() {
                sheetInfo2.myPlugin.deleteSelectedRow();
                hideWaitScreen();
            });
            //sheetInfo2.myPlugin.deleteSelectedRow();
        }
        else
            sheetInfo2.myPlugin.deleteSelectedCellText();
    }
    else if (event.keyCode == 90) // 'z'
    {
        if (event.metaKey || event.ctrlKey) // Cmd+Z, Ctrl+Z
        {
            event.preventDefault();
            if (event.shiftKey)
            {
                sheetInfo2.myPlugin.redo();									
            }
            else
            {
                sheetInfo2.myPlugin.undo();
            }
            return;
        }
    }
    else if (event.keyCode == 89) // 'y'
    {
        if (event.ctrlKey) // Ctrl+Y
        {
            event.preventDefault();
            sheetInfo2.myPlugin.redo();
        }
    }
    else if (event.keyCode >= 48)
    {
        if (event.metaKey == false && event.ctrlKey == false && event.altKey == false)
        {
            event.target.focus();
            sheetInfo2.tableHandler.startEditing(false);
        }
    }
}