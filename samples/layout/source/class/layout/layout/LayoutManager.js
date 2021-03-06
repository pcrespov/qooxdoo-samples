/* global window */
/* global document */

qx.Class.define("layout.layout.LayoutManager", {
  extend: qx.ui.container.Composite,

  construct: function() {
    this.base();

    this.set({
      width: this._getDocWidth(),
      height: this._getDocHeight()
    });

    this.set({
      layout: new qx.ui.layout.VBox()
    });

    this._NavBar = this._createNavigationBar();
    this._NavBar.setHeight(100);
    this.add(this._NavBar);

    this._PrjStack = this._getPrjStack();
    this.add(this._PrjStack, {
      flex: 1
    });

    let scope = this;
    window.addEventListener("resize", function() {
      scope.set({
        width: scope._getDocWidth(),
        height: scope._getDocHeight()
      });
    }, scope);
  },

  events: {},

  members: {
    _NavBar: null,
    _PrjStack: null,

    _getDocWidth: function() {
      let body = document.body;
      let html = document.documentElement;
      let docWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
      return docWidth;
    },

    _getDocHeight: function() {
      let body = document.body;
      let html = document.documentElement;
      let docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      return docHeight;
    },

    _createNavigationBar: function() {
      let navBar = new layout.layout.NavigationBar();

      let scope = this;
      navBar.addListener("HomePressed", function() {
        console.log("HomePressed");
        scope._PrjStack.setSelection([scope._PrjStack.getChildren()[0]]);
        scope._NavBar.setCurrentStatus("Browser");
      }, scope);

      navBar.setCurrentStatus("Browser");

      return navBar;
    },

    _getPrjStack: function() {
      let prjStack = new qx.ui.container.Stack();
      prjStack.set({
        backgroundColor: "black"
      });

      let prjBrowser = new layout.layout.PrjBrowser();
      let scope = this;
      prjBrowser.addListener("StartPrj", function(e) {
        console.log(e.getData());
        scope._PrjStack.setSelection([scope._PrjStack.getChildren()[1]]);
        scope._NavBar.setCurrentStatus(e.getData());
      }, scope);
      prjStack.add(prjBrowser);

      let prjEditor = new layout.layout.PrjEditor();
      prjStack.add(prjEditor);

      return prjStack;
    }
  },

  destruct: function() {
    this._disposeObjects("_Pane", "_Page2PaneLeft", "_Page2PaneRight");
  }
});
