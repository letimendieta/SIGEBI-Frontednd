import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/servicios/auth.service';
import { Router } from '@angular/router';
import { UsuarioModelo } from 'src/app/modelos/usuario.modelo';
import { TokenService } from 'src/app/servicios/token.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ComunesService } from 'src/app/servicios/comunes.service';
import md5 from 'md5';
import {Md5} from 'ts-md5/dist/md5';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  

  forma: FormGroup;
  isLogged = false;
  isLoginFail = false;
  loginUsuario: UsuarioModelo;
  nombreUsuario: string;
  password: string;
  roles: string[] = [];
  errMsj: string;
  alert:boolean=false;
  load = false;

  constructor(private frmbuilder: FormBuilder,
    private tokenService: TokenService,
    private comunes: ComunesService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.forma = this.frmbuilder.group({
      nombreUsuario: [''],
      password: ['']

    })
    if (this.tokenService.getToken()) {
      this.router.navigate(['/inicio']);
      this.isLogged = true;
      this.isLoginFail = false;
      this.roles = this.tokenService.getAuthorities();      
    }
  }

  onLogin(): void {
    this.cerrarAlert();
    this.load = true;

    var password = this.forma.get('password').value;
    this.loginUsuario = new UsuarioModelo(this.forma.get('nombreUsuario').value, password);
    this.authService.login(this.loginUsuario).subscribe(
      data => {
        
        this.isLogged = true;
        this.load = false;
        this.tokenService.setToken(data.token);
        this.tokenService.setUserName(data.nombreUsuario);
        this.tokenService.setAuthorities(data.authorities);
        this.roles = data.authorities;
        this.toastr.success('Bienvenido ' + data.nombreUsuario, 'OK', {
          timeOut: 3000, positionClass: 'toast-top-center'
        });
        this.router.navigate(['/inicio']);
      },
      err => {
        this.load = false;
        this.isLogged = false;
        this.errMsj = "Error al autenticarse: " +this.comunes.obtenerError(err);
        this.toastr.error(this.errMsj, 'Fail', {
          timeOut: 3000,  positionClass: 'toast-top-center',
        });
        this.alert=true;
      }
    );
  }

  cerrarAlert(){
    this.alert=false;
  }
}
