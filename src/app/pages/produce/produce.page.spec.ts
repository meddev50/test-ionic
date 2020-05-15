import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProducePage } from './produce.page';

describe('ProducePage', () => {
  let component: ProducePage;
  let fixture: ComponentFixture<ProducePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProducePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProducePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
