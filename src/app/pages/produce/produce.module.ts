import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProducePageRoutingModule } from './produce-routing.module';

import { ProducePage } from './produce.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProducePageRoutingModule
  ],
  declarations: [ProducePage]
})
export class ProducePageModule {}
