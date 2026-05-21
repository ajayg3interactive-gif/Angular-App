import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-fields',
  imports: [FormsModule],
  templateUrl: './input-fields.html',
  styleUrl: './input-fields.css',
})
export class InputFields {
  userName: string = '';


  getUserName(e: Event) {
    const name = (e.target as HTMLInputElement).value
    console.log(e)
    console.log(name)
  }

  getUserNameWithTemplate(val: string) {
    console.log(val)
  }

  showNgModelValue() {
    console.log(this.userName);
  }
}
