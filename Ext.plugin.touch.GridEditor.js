Ext.ns("Ext.plugin.touch");

Ext.plugin.touch.GridEditor = Ext.extend(Ext.util.Observable, {
	init: function(cmp) {
		var me = this;

		me.cmp = cmp;

		cmp.on("afterrender", me.initListeners, me);
		cmp.on("beforedestroy", me.cleanUp, me);
	},

	cleanUp: function() {
		var me = this;
		delete me.cmp;
		delete me.aboutEdit;
	},

	initListeners: function() {
		var me  = this,
			cmp = me.cmp;

		cmp.mon(cmp.body, {
			scope   : me,
			taphold : {
				delegate : "td.x-grid-cell",
				fn       : me.handleTap
			}
		});
	},

	handleTap: function(e, node) {
		var me       = this,
			cmp      = me.cmp,
			el       = Ext.get(node),
			index    = parseInt(el.getAttribute("rowIndex")),
			view     = cmp.getView(),
			store    = view.getStore(),
			rec      = store.getAt(index),
			value    = el.getHTML(),
			mappings = cmp.getMappings(),
			mapping  = el.getAttribute("mapping");

		me.aboutEdit = {
			grid   : cmp,
			record : rec,
			field  : mapping,
			value  : value,
			row    : index,
			column : mappings[mapping],
			el     : el
		};

		if (!cmp.fireEvent("beforeedit", me.aboutEdit)) { return false; }

		me.showPopup(value);
	},

	showPopup: function(value) {
		var me = this;

		var msg = Ext.Msg.show({
			title     : "Edit",
			prompt    : true,
			msg       : "Please enter a new value:",
			scope     : me,
			buttons   : Ext.MessageBox.OKCANCEL,
			icon      : Ext.MessageBox.QUESTION,
			fn        : me.handleEdit,
			value     : value
		});

		msg.on("hide", me.destroyMsgBox);
	},

	handleEdit: function(btn, text) {
		if (btn !== "ok") { return false; }

		var me        = this,
			cmp       = me.cmp,
			aboutEdit = me.aboutEdit,
			rec       = aboutEdit.record,
			mapping   = aboutEdit.field;

		if (aboutEdit.value === text) { return false; }

		rec.set(mapping, text);
		rec.setDirty();

		Ext.apply(aboutEdit, {
			originalValue : aboutEdit.value,
			value         : text
		});

		cmp.fireEvent("edit", aboutEdit);
	},

	destroyMsgBox: function(msg) {
		msg.destroy();
	}
});

Ext.preg("ext.plugin.touch.grideditor", Ext.plugin.touch.GridEditor);