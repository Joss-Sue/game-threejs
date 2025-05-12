window.fbAsyncInit = function () {
    FB.init({
        appId: '967801218249860',
        cookie: true,
        xfbml: true,
        version: 'v22.0'
    });

    FB.AppEvents.logPageView();

};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


function checkLoginState() {
    FB.api('/me', { fields: 'name' },function (response) {
        var nombre = sessionStorage.getItem("nombre");
        sessionStorage.setItem("nombre",response.name);
        localStorage.setItem("id",response.id);
        window.location.href = "menuPrincipal.html";
        statusChangeCallback(response);
    });
}