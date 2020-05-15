import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProduceService {

  url = 'http://localhost:8082/topics/test';
  constructor(private http: HttpClient) { }


  produce() {

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

    this.http.post(this.url, postData, options)
      .subscribe(data => {
        console.log(data['_body']);
       }, error => {
        console.log(error);
      });

  }
}
