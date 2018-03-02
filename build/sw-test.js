self.addEventListener('fetch', function(evt) {
  console.log('The service worker is serving the asset.');
  evt.respondWith(fromNetwork(evt.request, 400, evt).catch(function () {
    return fromCache(evt.request);
  }));
});


function fromNetwork(request, timeout, event) {
  return new Promise(function (fulfill, reject) {
    // Reject in case of timeout.
    var timeoutId = setTimeout(reject, timeout);
    // Fulfill in case of success.
    fetch(request).then(function (response) {
      clearTimeout(timeoutId);
      var res = response.clone();
      fulfill(response);
      event.waitUntil(update(request,res));
    // Reject also if network fetch rejects.
    }, reject);
  });
}

function fromCache(request) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}

function update(request, response) {
  return caches.open(cacheName).then(function (cache) {
    return cache.put(request, response);
  });
}
