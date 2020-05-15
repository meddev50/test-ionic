import { Component } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { options } from './home.interfaces/home.options';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { Uid } from '@ionic-native/uid/ngx';

import { Toast } from '@ionic-native/toast/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { coords } from './home.interfaces/home.coords.model';

import { ProduceService } from './../services/produce.service';
import { Observable } from 'rxjs';

import { Network } from '@ionic-native/network/ngx';

import { Dialogs } from '@ionic-native/Dialogs/ngx';

import { DatabaseService, Rec } from './../services/database.service';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  results: Observable<any>;


  records: Rec[] = [];

  record = {};

  latitude: number; //latitude
  longitude: number; //longitude
  accuracy: number;

  altitude: number;
  altitudeAccuracy: number;
  speed: number;

  timestamp: any;

  timeTest: any;
  UniqueDeviceID: string;
  options: options;

  connect: boolean;
  constructor(private storage: Storage, private db: DatabaseService, private dialogs: Dialogs, private network: Network, private geolocation: Geolocation, private nativeGeocoder: NativeGeocoder,
    private androidPermissions: AndroidPermissions, private locationAccuracy: LocationAccuracy,
    private uniqueDeviceID: UniqueDeviceID, private uid: Uid, private toast: Toast, private http: HttpClient, private produceService: ProduceService) {

    this.latitude = 0;
    this.longitude = 0;
    this.accuracy = 0;

    this.altitude = 0;
    this.altitudeAccuracy = 0;
    this.speed = 0;

    this.timeTest = Date.now();

    this.options = {
      timeout: 10000,
      enableHighAccuracy: true,
      maximumAge: 3600
    }
    this.getPermission();


  }
  //Check if application having GPS access permission  
  checkGPSPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {

          //If having permission show 'Turn On GPS' dialogue
          this.askToTurnOnGPS();
        } else {

          //If not having permission ask for permission
          this.requestGPSPermission();
        }
      },
      err => {
        alert(err);
      }
    );
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log("4");
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              //Show alert if user click on 'No Thanks'
              alert('requestPermission Error requesting location permissions ' + error)
            }
          );
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => {
            // When GPS Turned ON call method to get Accurate location coordinates
            this.getLocationCoordinates();
          },
          //  error => alert('Error requesting location permissions ' + JSON.stringify(error))
        );
      }
    });

  }


  // Methos to get device accurate coordinates using device GPS
  getLocationCoordinates() {
    this.askToTurnOnGPS();
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      this.accuracy = resp.coords.accuracy;

      this.altitude = resp.coords.altitude;
      this.altitudeAccuracy = resp.coords.altitudeAccuracy;
      this.speed = resp.coords.speed;

      this.timestamp = resp.timestamp;

      let dataToStorage = {
        "records": [
          {
            "value": {
              "latitude": this.latitude,
              "longitude": this.longitude,
              "accuracy": this.accuracy,
              "altitude": this.altitude,
              "altitudeAccuracy": this.altitudeAccuracy,
              "speed": this.speed,
              "timestamp": this.timestamp,
              "uniqueDeviceID": this.UniqueDeviceID
            }
          }
        ]
      }

      this.storage.set('records', dataToStorage);

    }).catch((error) => {

      alert('Error getting location' + error);
    });
  }

  getprevious() {
    this.storage.get('records').then(data => {
      if (data) {
        alert("this" + JSON.stringify(data));
      }
    });
  }
  getUniqueDeviceID() {
    this.uniqueDeviceID.get()
      .then((imei: any) => {
        console.log(imei);
        this.UniqueDeviceID = imei;
      })
      .catch((error: any) => {
        console.log(error);
        this.UniqueDeviceID = "Error! ${error}";
      });
  }

  getPermission() {
    this.androidPermissions.checkPermission(
      this.androidPermissions.PERMISSION.READ_PHONE_STATE
    ).then(res => {
      if (res.hasPermission) {

      } else {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE).then(res => {

        }).catch(error => {
          alert("Error! " + error);
        });
      }
    }).catch(error => {
      alert("Error! " + error);
    });
  }

  getID_UID(type) {
    if (type == "IMEI") {
      return this.uid.IMEI;
    } else if (type == "ICCID") {
      return this.uid.ICCID;
    } else if (type == "IMSI") {
      return this.uid.IMSI;
    } else if (type == "MAC") {
      return this.uid.MAC;
    } else if (type == "UUID") {
      return this.uid.UUID;
    }
  }

  callProduce() {
    // this.network.onDisconnect().subscribe(() => {
    //   alert('Network was disconnected :-() : cant produce insert into datatabase')
    // });
    // this.network.onConnect().subscribe(() => {
    //   setTimeout(() => {
    //     alert('we Got a :' + this.network.type + ' Connection , we Can Produce Now !!')


    let headers = new HttpHeaders({
      'Accept': 'application/vnd.kafka.v2+json',
      'Content-Type': 'application/vnd.kafka.json.v2+json'
    });
    let options = {
      headers: headers
    }
    let postData = {
      "records": [
        {
          "value": {
            "foo": "bar"
          }
        }
      ]
    }

    let postData2 = {
      "records": [
        {
          "value": {
            "latitude": this.latitude,
            "longitude": this.longitude,
            "accuracy": this.accuracy,
            "altitude": this.altitude,
            "altitudeAccuracy": this.altitudeAccuracy,
            "speed": this.speed,
            "timestamp": this.timestamp,
            "uniqueDeviceID": this.UniqueDeviceID
          }
        }
      ]
    }
    for (var i = 0; i < 1000; i++) {


      this.http.post("http://localhost:8082/topics/test", postData2, options)
        .subscribe(data => {
          console.log(data['_body']);
          console.log(JSON.stringify(data));
        }, error => {
          console.log(error);
        });
      //   }, 2000);
      // });
    }
  }

  getRcords() {
    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.db.getRecs().subscribe(devs => {
          this.records = devs;
        })
      }
    });
  }

  addRecord() {
    this.db.addRecord(this.latitude.toString, this.longitude.toString, this.timestamp.toString)
      .then(_ => {
        this.record = {};
      });
  }


  // geocoder options
  nativeGeocoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };




}
