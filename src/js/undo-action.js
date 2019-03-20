/**
 * 
 */

function UndoAction(actionTarget)
{
	this.targetList = new Array();

	if (typeof actionTarget != 'undefined')
		this.targetList.push(actionTarget);

	this.addTarget = function(actionTarget)
	{
		this.targetList.push(actionTarget);
	}

	this.getTargetLength = function()
	{
		return this.targetList.length;
	}

}
