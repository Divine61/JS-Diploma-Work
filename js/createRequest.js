"use strict"

function createRequest(request) {
  const xhr = new XMLHttpRequest;
  xhr.open(request.method, request.url);
  if (request.responseType) {
    xhr.responseType = request.responseType;
  }
  xhr.setRequestHeader(request.setRequestHeader.header, request.setRequestHeader.headerValue);
  // try {
  //   xhr.send(request.event);
  // } catch (error) {
  //   const err = new Error('Request Error');
  //   return err
  // }
  xhr.send(request.event);
  return xhr
}

// const createRequest = (options = {}) => {
//   const f = function () {},
//       {
//           method = 'GET',
//           headers = {},
//           success = f,
//           error = f,
//           callback = f,
//           responseType,
//           async = true,
//           data = {}
//       } = options,
//       xhr = new XMLHttpRequest;

//   let { url } = options;

//   let requestData;
//   if (responseType) {
//       xhr.responseType = responseType;
//   }
//   xhr.onload = function() {
//       success.call( this, xhr.response );
//       callback.call( this, null, xhr.response );
//   };
//   xhr.onerror = function() {
//       const err = new Error( 'Request Error' );
//       error.call( this, err );
//       callback.call( this, err );
//   };

//   xhr.withCredentials = true;

//   if ( method === 'GET' ) {
//       const urlParams = Object.entries( data )
//           .map(([ key, value ]) => `${key}=${value}` )
//           .join( '&' );
//       if ( urlParams ) {
//           url += '?' + urlParams;
//       }
//   }
//   else {
//       requestData = Object.entries( data )
//           .reduce(( target, [ key, value ]) => {
//               target.append( key, value );
//               return target;
//           }, new FormData );
//       // requestData = data;
//   }
//   try {
//       xhr.open( method, url, async );
//       xhr.send( requestData );
//   }
//   catch ( err ) {
//       error.call( this, err );
//       callback.call( this, err );
//       return xhr;
//   }

//   return xhr;
// };