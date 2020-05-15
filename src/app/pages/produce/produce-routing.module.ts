import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProducePage } from './produce.page';

const routes: Routes = [
  {
    path: '',
    component: ProducePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProducePageRoutingModule {}
