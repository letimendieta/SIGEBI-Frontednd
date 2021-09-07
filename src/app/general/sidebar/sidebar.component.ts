import { Component, OnInit,ViewChild,Output,EventEmitter} from '@angular/core';
import { TokenService } from 'src/app/servicios/token.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

    isLogged = false;
    nombreUsuario = '';
        
    @Output()
    toggleSideBarForMe: EventEmitter<any>= new EventEmitter();
  
    
    constructor(private tokenService: TokenService) { }

    ngOnInit() {
      if (this.tokenService.getToken()) {
        this.isLogged = true;
        this.nombreUsuario = this.tokenService.getUserName();
      } else {
        this.isLogged = false;
        this.nombreUsuario = '';
      }
    }

    toggleSideBar() {
      this.toggleSideBarForMe.emit();
      setTimeout(() => {
        window.dispatchEvent(
          new Event('resize')
        );
      }, 300);
    }
  

}
