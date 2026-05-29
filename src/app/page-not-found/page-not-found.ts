import { Component } from '@angular/core';
import { Sidebar } from "../components/sidebar/sidebar";

@Component({
  selector: 'app-page-not-found',
  imports: [Sidebar],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css',
})
export class PageNotFound {}
