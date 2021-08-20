import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ParametroModelo } from '../../../modelos/parametro.modelo';
import { ParametrosService } from '../../../servicios/parametros.service';
import { ComunesService } from 'src/app/servicios/comunes.service';
import Swal from 'sweetalert2';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-parametro',
  templateUrl: './parametro.component.html',
  styleUrls: ['./parametro.component.css']
})
export class ParametroComponent implements OnInit {
  crear = false;
  parametroForm: FormGroup;
  parametro: ParametroModelo = new ParametroModelo();
  alertGuardar:boolean=false;

  constructor( private tokenService: TokenService,
               private parametrosService: ParametrosService,
               private route: ActivatedRoute,
               private comunes: ComunesService,
               private router: Router,
               private fb: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.parametroForm.get('estado').setValue('A');
    if ( id !== 'nuevo' ) {
      
      this.parametrosService.getParametro( Number(id) )
        .subscribe( (resp: ParametroModelo) => {
          this.parametroForm.patchValue(resp);
        });
    }else{
      this.crear = true;
    }
  }
  
  guardar(  ) {
    this.cerrarAlertGuardar();
    if ( this.parametroForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.parametroForm.controls ).forEach( control => {

        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }

    Swal.fire({
      title: 'Espere',
      text: 'Guardando información',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    let peticion: Observable<any>;

    this.parametro = this.parametroForm.getRawValue();

    if ( this.parametro.parametroId ) {
      //Modificar
      this.parametro.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.parametrosService.actualizarParametro( this.parametro );
    } else {
      //Agregar
      this.parametro.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.parametrosService.crearParametro( this.parametro );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: this.parametro.codigoParametro,
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( this.parametro.parametroId ) {
            this.router.navigate(['/parametros']);
          }else{
            this.limpiar();
          }
        }
      });
    }, e => {Swal.fire({
              icon: 'error',
              title: 'Algo salió mal',
              text: this.comunes.obtenerError(e),
            })
       }
    );
  }

  limpiar(){
    this.parametro = new ParametroModelo();
    this.parametroForm.reset();
    this.parametroForm.get('estado').setValue('A');
  }

  obtenerError(e : any){
    var mensaje = "Error indefinido ";
      if(e.error.mensaje){
        mensaje = e.error.mensaje;
      }
      if(e.error.message){
        mensaje = e.error.message;
      }
      if(e.error.errors){
        mensaje = mensaje + ' ' + e.error.errors[0];
      }
      if(e.error.error){
        mensaje = mensaje + ' ' + e.error.error;
      }
    return mensaje;  
  }

  crearFormulario() {

    this.parametroForm = this.fb.group({
      parametroId  : [null, [] ],
      codigoParametro  : [null, [ Validators.required]  ],
      descripcion  : [null, [] ],
      nombre: [null, [] ],
      valor: [null, [] ],
      descripcionValor: [null, [] ],
      estado: [null, [] ],      
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ]
    });

    this.parametroForm.get('parametroId').disable();
    this.parametroForm.get('fechaCreacion').disable();
    this.parametroForm.get('fechaModificacion').disable();
    this.parametroForm.get('usuarioCreacion').disable();
    this.parametroForm.get('usuarioModificacion').disable();
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
