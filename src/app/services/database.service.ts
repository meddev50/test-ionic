import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { HttpClient } from '@angular/common/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
 
export interface Rec {
  id: number,
  latitude: string,
  longitude: string,
  dateTim: string
}
 
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
 
  records = new BehaviorSubject([]);
 
  constructor(private plt: Platform, private sqlitePorter: SQLitePorter, private sqlite: SQLite, private http: HttpClient) {
    this.plt.ready().then(() => {
      this.sqlite.create({
        name: 'records.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
          this.database = db;
          this.seedDatabase();
      });
    });
  }
 
  seedDatabase() {
    this.http.get('src/assets/seed.sql', { responseType: 'text'})
    .subscribe(sql => {
      this.sqlitePorter.importSqlToDb(this.database, sql)
        .then(_ => {
          this.loadRecords();
          this.dbReady.next(true);
        })
        .catch(e => console.error(e));
    });
  }
 
  getDatabaseState() {
    return this.dbReady.asObservable();
  }
 
  getRecs(): Observable<Rec[]> {
    return this.records.asObservable();
  }

loadRecords() {
    return this.database.executeSql('SELECT * FROM records', []).then(data => {
      let records: Rec[] = [];
 
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
      
          records.push({ 
            id: data.rows.item(i).id,
            latitude: data.rows.item(i).latitude, 
            longitude: data.rows.item(i).longitude,
            dateTim: data.rows.item(i).dateTim
           });
        }
      }
      this.records.next(records);
    });
  }
 
  addRecord(latitude, longitude, dateTim) {
    let data = [latitude, longitude, dateTim];
    return this.database.executeSql('INSERT INTO record (latitude, longitude, dateTim) VALUES (?, ?, ?)', data).then(data => {
      this.loadRecords();
    });
  }

}