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
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  function checkLoginState() {
    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        FB.api('/me', { fields: 'name,email' }, function (fbUser) {
          fetch('/login/facebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              facebookId: fbUser.id,
              nombre: fbUser.name,
              email: fbUser.email
            })
          }).then(res => {
            if (res.ok) {
              window.location.href = "/index.html";
            } else {
              alert("No se pudo iniciar sesión con Facebook");
            }
          });
        });
      } else {
        alert('Por favor inicia sesión con Facebook');
      }
    });
  }