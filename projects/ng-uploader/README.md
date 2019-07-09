<h1 align="center">ng-uploader</h1>
<p>
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/trendster-io/ng-uploader#readme">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" target="_blank" />
  </a>
  <a href="https://github.com/trendster-io/ng-uploader/graphs/commit-activity">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" target="_blank" />
  </a>
  <a href="https://github.com/trendster-io/ng-uploader/blob/master/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" target="_blank" />
  </a>
</p>

> A fully featured Angular file uploader that utilizes Angular's HttpClient internally, allows you to customize outgoing HTTP requests using the "Angular Way" (Interceptors), provides customizable concurrent queuing of uploads and a simple way to select files via drag & drop.

<!-- ### 🏠 [Homepage](https://github.com/trendster-io/ng-uploader) -->

## 📝 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Install](#install)
- [Setup](#setup)
- [Usage](#usage)
- [Author](#author)
- [Contributing](#contributing)
- [Show your support](#support)
- [License](#license)

## ✨Features <a name = "features"></a>

- ### Familiar API

  The library is inspired by the awesome [ng2-file-upload](https://github.com/valor-software/ng2-file-upload) that has long been the standard way of implementing file uploads in Angular, in addition, it adds some cool features and implements functionality that spares you some workarounds.

- ### HttpClient

  Utilizes Angular's HttpClient and not direct XHR, which means that you have total control of your outgoing HTTP requests via interceptors. Wether you need to add headers, an authentication token or enable withCredentials for cookies usage, you are in full control of how to process your requests before sending them out.

  Utilizing HttpClient solves popular problems with other uploader libraries that uses direct XHR and are not compatible with interceptors, for example: automatically retrying failed requests or refreshing an expired access token on failed upload.

  For refreshing an expired access token, we usually rely on an interceptor to catch the expiry error, refresh the token, queue any other request that is sent while refreshing, update the access token and then resend the initial along with the queued ones. In other libraries, using direct XHR results in an issue that occurs because uploads that were sent with an access token used to fail every now and then and would require explicit intervention. [Example](https://github.com/trendster-io/ng-uploader/blob/master/projects/ng-uploader-demo/src/app/auth.interceptor.ts)

- ### Queuing

  Provides an easy way to control how your uploads are processed in a queue, wether you want to upload them one at a time, or prefer sending batches of N concurrent requests at a time, we have got you covered.

- ### Reactive

  All events are provided as Observables that you can subscribe to, instead of requiring you to set a listener function for each event, and thus, easier to work with and more Angular-ish.

- ### Drag & Drop

  Provides a simple convenience directive to turn any element into a Dropzone, enabling drag and drop files selection easily, however, this is not coupled to using our uploader in any way. In other words, we provide you with a simple way to achieve drag & drop files selection that you can then use our uploader to upload. Credits go to [@darrenmothersele](https://github.com/darrenmothersele) for the directive.

## ✅ Prerequisites <a name = "prerequisites"></a>

The library uses Angular's HttpClient, if you are not already using it in your project, then you have to add it in your root AppModule, example:

```js
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## ⬇️ Install <a name = "install"></a>

Using npm

```sh
npm install --save @trendster-io/ng-uploader
```

Using yarn

```sh
yarn add @trendster-io/ng-uploader
```

## 🛠 Setup <a name = "setup"></a>

Once installed you need to import our module in the parent module for the component you will be using it in:

```js
import { UploaderModule } from '@trendster-io/ng-uploader';

@NgModule({
  ...
  imports: [UploaderModule, ...],
  ...
})
export class YourModule {
}
```

## Usage <a name = "usage"></a>

The API is quite similar to that of [ng2-file-upload](https://github.com/valor-software/ng2-file-upload), so if you have used it before, most probably you can use this one easily:

### API

[UploaderOptions](https://github.com/trendster-io/ng-uploader/blob/master/projects/ng-uploader/src/lib/models/UploaderOptions.ts)

- ### Properties

  `url`: A general upload endpoint `string` that applies on any item that doesn't explicitly specify one.

  `method`: A general HTTP Method `string` for the request that applies on any item that doesn't explicitly specify one.

  `autoUpload`: A `boolean` to upload items automatically right after their addition to the queue.

  `removeAfterUpload`: A `boolean` to remove items automatically right after their upload.

  `queueLimit`: A `number` to specify the maximum items a queue can have at a time.

  `concurrency`: A `number` to specify how many items should be uploaded at the same time.

  `maxFileSize`: A `number` to specify the maximum file size of an item in Bytes.

  `allowedMimeTypes`: A `string[]` containing MimeTypes that specify a whitelist of file types that are accepted by the uploader.

[UploadItemOptions](https://github.com/trendster-io/ng-uploader/blob/master/projects/ng-uploader/src/lib/models/UploadItemOptions.ts)

- ### Properties

  `url`: An upload endpoint `string` that applies on the item. Overrides the one specified in the uploader.

  `method`: An HTTP method `string` that applies on the item. Overrides the one specified in the uploader.

  `file`: A `File` that should be uploaded by this item.

  `fileAlias`: A `string` that defines the file's key name in the `FormData` body that will be sent in the request.

  `additionalParams`: An `object` that contains additional params that should be added to the `FormData` request body in addition to the `File`.

[UploadItem](https://github.com/trendster-io/ng-uploader/blob/master/projects/ng-uploader/src/lib/upload-item.class.ts)

- ### Properties

  `progress`: A `number` indicating the progress of the upload from 0 - 100.

  `req`: The `HTTPRequest` instance that will be sent when the upload starts.

  `preview`: An `Observable<string>` that contains a DataURL for the media if the file is an image or a video. It returns `undefined` otherwise.

  `isReady`: A `boolean` to indicate that this item is queued for upload.

  `isUploading`: A `boolean` to indicate that this item is currently being uploaded.

  `isUploaded`: A `boolean` to indicate that this item was uploaded.

  `isCancelled`: A `boolean` to indicate that this item's upload was cancelled.

  `isError`: A `boolean` to indicate that this item has encountered an error while uploading.

  `onResponse`: An `Observable<any>` that emits with the HTTP Response on upload success.

  `onProgress`: An `Observable<number>` that emits with the upload progress updates.

  `onError`: An `Observable<HttpErrorResponse>` that emits on upload error.

* ### Methods

  `upload`: Starts uploading the item.

  `cancel`: Cancels uploading the item, but still keeps it in the queue.

  `remove`: Removes the item from the queue and cancels uploading it if it was uploading or ready.

[Uploader](https://github.com/trendster-io/ng-uploader/blob/master/projects/ng-uploader/src/lib/uploader.class.ts)

- ### Properties

  `totalProgress`: A `number` indicating the progress of the whole queue's upload from 0 - 100.

  `isUploading`: A `boolean` to indicate that the uploader is currently uploading items in the queue.

  `items`: An `UploadItem[]` of the items in the queue.

  `itemsCount`: A `number` indicating the count of items in the queue.

  `readyItemsCount`: A `number` indicating the count of ready items in the queue.

  `uploadingItemsCount`: A `number` indicating the count of uploading items in the queue.

  `uploadedItemsCount`: A `number` indicating the count of uploaded items in the queue.

  `notUploadedItemsCount`: A `number` indicating the count of non-uploaded(Ready, Cancelled, Uploading, Errored) items in the queue.

  `cancelledItemsCount`: A `number` indicating the count of cancelled items in the queue.

  `errorItemsCount`: A `number` indicating the count of errored items in the queue.

  `onItemSuccess`: An `Observable<{item: UploadItem, res: any}>` that emits with the item and the HTTP Response on item upload success.

  `onItemProgress`: An `Observable<{item: UploadItem, progress: number}>` that emits with the item and its progress on item progress updates.

  `onItemError`: An `Observable<{item: UploadItem, err: HttpErrorResponse}>` that emits with item and the upload error.

* ### Methods

  `addItem`: A method that receives an [UploadItemOptions](https://github.com/trendster-io/ng-uploader/blob/master/projects/ng-uploader/src/lib/models/UploadItemOptions.ts) and returns an [UploadItem](https://github.com/trendster-io/ng-uploader/blob/master/projects/ng-uploader/src/lib/upload-item.class.ts) instance. Throws an error in the following cases:

  1.  A general `url` or `method` wasn't provided to the uploader and also individual ones were not provided in the item options.
  2.  The `queueLimit` is reached.
  3.  The passed file surpasses the `maxFileSize`.
  4.  The file type is not in the `allowedMimeTypes` array.

  `uploadAll`: Starts uploading all items in queue.

  `cancelAll`: Cancels all uploading items while keeping them in the queue.

  `clearQueue`: Removes all items from the queue, and cancels any of them if uploading before removal.

[UploaderService](https://github.com/trendster-io/ng-uploader/blob/master/projects/ng-uploader/src/lib/uploader.service.ts)

- ### Methods

  `getUploader`: A method that receives an [UploaderOptions](https://github.com/trendster-io/ng-uploader/blob/master/projects/ng-uploader/src/lib/models/UploaderOptions.ts) and returns a new [Uploader](https://github.com/trendster-io/ng-uploader/blob/master/projects/ng-uploader/src/lib/uploader.class.ts) instance.

### [Demo Implementation](https://github.com/trendster-io/ng-uploader/blob/master/projects/ng-uploader-demo/src/app/app.component.ts)

## Author <a name = "author"></a>

👤 **Omar Doma**

- Github: [@omardoma](https://github.com/omardoma)

## 🤝 Contributing <a name = "contributing"></a>

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/trendster-io/ng-uploader/issues).

## Show your support <a name = "support"></a>

Give a ⭐️ if this project helped you!

## 📝 License <a name = "license"></a>

Copyright © 2019 [Trendster](https://github.com/trendster-io).<br />
This project is [MIT](https://github.com/trendster-io/ng-uploader/blob/master/LICENSE) licensed.
