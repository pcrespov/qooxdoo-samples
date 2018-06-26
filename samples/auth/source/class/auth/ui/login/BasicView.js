/**
 * Creates a standard widget for a login
 *
 *  Features:
 *    - Login form
 *    - Some decoration
 *
 */
qx.Class.define("auth.ui.login.BasicView", {

  extend: qx.ui.container.Composite,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct: function () {
    this.base(arguments);

    let header = this.__createHeader();
    this.__form = new auth.ui.login.Form();

    // TODO : add Forgot Password? | Create Account? links
    let footer = new qx.ui.core.Widget();

    this.__createLayout(header,
      new qx.ui.form.renderer.Single(this.__form),
      footer);

    this.__form.addListener("submit", this.__onSubmitLogin, this);
  },

  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */
  members: {
    __form: null,
    __auth: new qx.io.request.authentication.Basic("", ""),

    __createHeader: function () {
      const isDev = qx.core.Environment.get("qx.debug") ? true : false;

      // TODO: bind label and icon to this property

      let header = new qx.ui.basic.Atom().set({
        icon: "auth/itis.png",
        iconPosition: "top",
      });

      return header;
    },

    __createLayout: function (header, login, footer) {
      // http://www.qooxdoo.org/5.0.2/pages/desktop/ui_layouting.html
      // http://www.qooxdoo.org/5.0.2/pages/layout.html
      // http://www.qooxdoo.org/5.0.2/pages/layout/box.html
      // http://www.qooxdoo.org/5.0.2/demobrowser/#layout~VBox.html

      const isDev = qx.core.Environment.get("qx.debug") ? true : false;

      // LayoutItem
      this.set({
        padding: 10,
      });

      this.setLayoutProperties({
        allowGrowY: false
      });

      login.set({
        //backgroundColor: isDev ? "red" : null,
        // width: 100 // TODO: themed?
      });

      // Set buttom wider
      login.getLayout().set({
        //spacingY: 10 // TODO: themed?
      });

      footer.set({
        // backgroundColor: isDev ? "blue" : null
      });


      // Children's layout management
      let layout = new qx.ui.layout.VBox().set({
        alignY: "middle",
        spacing: 20, // TODO: themed?
      });
      this.setLayout(layout);


      // Example of item properties {flex:0, width='%'} passed as options.
      // notice that these options are specific for every layout abstraction!
      // the he uses the api LayoutItem.setLayoutProperties to set computed layout
      // considering parent layout hints
      this.add(header);
      this.add(login);
      // this.add(footer);
    },

    __onSubmitLogin: function (e) {
      var loginData = e.getData();

      let auth = new qx.io.request.authentication.Basic(
        loginData.username,
        loginData.password)

      // Requests authentication to server
      // TODO: mimetypes supported??
      let req = new qx.io.request.Xhr("api/v1.0/login", "POST");
      req.set({
        accept: "application/json",
        authentication: auth,
        //requestData: {
        //  email: loginData.username,
        //  password: loginData.password
        //},
        cache: false
      });

      req.addListener("success", this.__onLoginSucceed, this);
      req.addListener("fail", this.__onLoginFailed, this);
      req.send();
    },

    __onLoginSucceed: function (e) {
      let req = e.getTarget();
      console.debug("Login suceeded:",
        "status  :", req.getStatus(),
        "phase   :", req.getPhase(),
        "response: ", req.getResponse()
      );


      // TODO: implement token-based authentication: we can request token and from that moment on,
      // just use that...      
      const token = req.getResponse().token;
      this.__auth = new qx.io.request.authentication.Basic(token, null)

      this.fireDataEvent("login", true);
    },

    __onLoginFailed: function (e) {
      const req = e.getTarget();
      console.debug("Login failed:",
        "status  :", req.getStatus(),
        "phase   :", req.getPhase(),
        "response: ", req.getResponse()
      );

      let msg = null;
      if (req.getStatus() != 401) {
        msg = "Unable to login. Server returned " + String(req.getStatus());
      }      
      this.__form.flashInvalidLogin(msg);

      this.fireDataEvent("login", false);
    },

  },

  /*
  *****************************************************************************
   EVENTS
  *****************************************************************************
  */
  events: {
    "login": "qx.event.type.Data"
  },

});