import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TokenService } from 'src/app/servicios/token.service';
import { Router } from '@angular/router';
import { Usuario2Modelo } from 'src/app/modelos/usuario2.modelo';
import { GlobalConstants } from 'src/app/common/global-constants';
import { UsuariosService } from 'src/app/servicios/usuarios.service';
import { ComunesService } from 'src/app/servicios/comunes.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLogged = false;
  @Output()
  toggleSideBarForMe: EventEmitter<any>= new EventEmitter();

  constructor(private tokenService: TokenService,
              private router:Router,
              private usuariosService: UsuariosService,
              private comunes: ComunesService) { }

  nombreUsuario = '';
  nombre = '';
  apellido = '';
  area = '';
  usuarioActual: Usuario2Modelo;

  ngOnInit() {
    if (this.tokenService.getToken()) {
          this.isLogged = true;
          this.nombreUsuario = this.tokenService.getUserName();
          this.obtenerUsuarioActual(this.nombreUsuario);
        } else {
          this.isLogged = false;
          this.nombreUsuario = '';
        }       
  }

  obtenerUsuarioActual(usuario){
    var usuarioModel = new Usuario2Modelo();
    usuarioModel.nombreUsuario = usuario;
    usuarioModel.estado = GlobalConstants.ACTIVO;
    this.usuariosService.buscarUsuariosFiltrosTabla(usuarioModel).subscribe( (resp: Usuario2Modelo[]) => {
      if(resp.length > 0 ){
        this.usuarioActual = resp[0];  
        this.nombre = this.usuarioActual.funcionarios.personas.nombres;
        this.apellido = this.usuarioActual.funcionarios.personas.apellidos;
        this.area = this.usuarioActual.funcionarios.areas.descripcion;
      }      
    }, e => {
       console.log(this.comunes.obtenerError(e));
    });
  }

  onLogOut(): void {
    this.tokenService.logOut();
    
      this.router.navigate(["/login"]); //for the case 'the user logout I want him to be redirected to home.'

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
