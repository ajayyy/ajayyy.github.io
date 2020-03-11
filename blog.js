let hash = window.location.hash.substr(1);

if (hash === "") {
    window.location.href = "https://blog.ajay.app/";
} else if (hash.startsWith("/tag")) {
    window.location.href = "https://blog.ajay.app/" + hash.split("=")[1];
} else {
    window.location.href = "https://blog.ajay.app/" + hash;
}
