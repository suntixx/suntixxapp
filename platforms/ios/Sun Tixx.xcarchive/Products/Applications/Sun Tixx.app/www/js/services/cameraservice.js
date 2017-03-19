var Images = {

  cropper: function(image, aspectRatio, cropArea) {
    if(!cropArea) {cropArea = 1;}
    var newCropper = new Cropper(image, {
      dragMode: 'move',
      viewMode:1,
      aspectRatio: aspectRatio,
      autoCropArea: cropArea,
      restore: false,
      guides: false,
      center: false,
      highlight: false,
      cropBoxMovable: false,
      cropBoxResizable: false,
    });

    return newCropper;
  },

  ticketCropper: function (image) {
    var newCropper = new Cropper(image, {
      dragMode: 'move',
      viewMode:3,
      //aspectRatio: aspectRatio,
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      rotatable: false,
      responsive: false,
      modal:true,
      scalable: false,
      zoomable: false,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
    });

    return newCropper;
  },

  ticketCameraOptions: function() {
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      //destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      correctOrientation: true,
      allowEdit: false,
      targetWidth: 300,
      targetHeight:300,
      saveToPhotoAlbum: false,
      cameraDirection: Camera.Direction.BACK
    };

    return options;
  },


  cameraOptions: function() {
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      //destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      correctOrientation: true,
    };

    return options;
  },


/*  cropImage: function() {
    var image = cropper.getCroppedCanvas().toDataURL('image/jpeg')
    var originalImage = $$(document).find('#imageCropper').prop('src');
    var blob = util.dataToBlob(image);
    var cropData = cropper.getData();
    window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
      fs.root.getFile("tmpimage.jpg", { create: true, exclusive: false }, function (fileEntry) {
        var imagePath = fileEntry.toURL();
        fileEntry.createWriter(function (fileWriter) {
          fileWriter.onwriteend = function() {
            cropper.destroy();
            var location = '#add-'+imageType+'-image';
            $$(document).find(location).prop('src', imagePath);
            app.closeModal('.image-popup');
            var options = new FileUploadOptions();
            options.fileName = Math.random() + '.jpg';
            options.mimeType = "image/jpeg";
            options.fileKey = "file";
            options.httpMethod = "POST";
            var container = $$('body');
            var imageUploadURL;
            var imageSave;
            if (imageType == "event") {
              imageUploadURL = JSON.parse(Server.eventImageUpload(request));
            } else if (imageType == "ticket") {
              imageUploadURL = JSON.parse(Server.ticketImageUpload(request));
            } else if (imageType == "user") {
              imageUploadURL = JSON.parse(Server.userImageUpload(request));
            }
            var ft = new FileTransfer();
            ft.onprogress = function(progressEvent) {
              app.showProgressbar(container, 'yellow');
            /*  if (progressEvent.lengthComputable) {
                  var uploadProgress = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                  app.setProgressbar(container, uploadProgress);
              } else {
                  app.showProgressbar(container, 'yellow');
              }

            };
            ft.upload(originalImage, encodeURI(imageUploadURL), function(data) {
              app.hideProgressbar();data = data.response.split(':');
              var imageServerPath = data[1];
              imageServerPath = imageServerPath.substring(1, imageServerPath.length - 2 );
              var locationPath = location+'-path';
              $$(document).find(locationPath).val(imageServerPath);
              var imageData = [];
              var item = {
                cropX: Math.round(cropData.x),
                cropY: Math.round(cropData.y),
                cropW: Math.round(cropData.width),
                cropH: Math.round(cropData.height)
              };
              imageData.push(item);
              var request = {
                ticketId: thisTicket.id,
                ticketType: thisTicket.tickettype,
                src: imageServerPath,
                images: imageData,
                eventId: selectedEventLocal.id
              };
              var result;
              if (imageType == "event") {
                result = JSON.parse(Server.eventImageSave(request));
              } else if (imageType == "ticket") {
                result = JSON.parse(Server.ticketImageSave(request));
              } else if (imageType == "user") {
                result = JSON.parse(Server.userImageSave(request));
              }
            }, function (err) {
              app.hideProgressbar();
              cropper.destroy();
              err = JSON.stringify(err);
              app.alert("Unable to upload image: "+ err);
            }, options);
          };
          fileWriter.onerror = function (e) {
            alert("Failed file read: " + e.toString());
          };
          fileWriter.write(blob);
        });
      }, function () {alert('create error');   cropper.destroy();});
    }, function () {alert('fs error');   cropper.destroy();});
  }*/


};
