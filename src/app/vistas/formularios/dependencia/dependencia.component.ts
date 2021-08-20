import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { DependenciaModelo } from '../../../modelos/dependencia.modelo';
import { DependenciasService } from '../../../servicios/dependencias.service';

import Swal from 'sweetalert2';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-dependencia',
  templateUrl: './dependencia.component.html',
  styleUrls: ['./dependencia.component.css']
})
export class DependenciaComponent implements OnInit {
  crear = false;
  dependenciaForm: FormGroup;
  alertGuardar:boolean=false;
  dependencia: DependenciaModelo = new DependenciaModelo();

  constructor( private tokenService: TokenService,
               private dependenciasService: DependenciasService,
               private route: ActivatedRoute,
               private comunes: ComunesService,
               private router: Router,
               private fb: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.dependenciaForm.get('estado').setValue('A');
    if ( id !== 'nuevo' ) {
      
      this.dependenciasService.getDependencia( Number(id) )
        .subscribe( (resp: DependenciaModelo) => {
          this.dependenciaForm.patchValue(resp);
        });
    }else{
      this.crear = true;
    }
  }  

  guardar( ) {
    this.cerrarAlertGuardar();
    if ( this.dependenciaForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.dependenciaForm.controls ).forEach( control => {

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

    this.dependencia = this.dependenciaForm.getRawValue();

    if ( this.dependencia.dependenciaId ) {
      //Modificar
      this.dependencia.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.dependenciasService.actualizarDependencia( this.dependencia );
    } else {
      //Agregar
      this.dependencia.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.dependenciasService.crearDependencia( this.dependencia );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: this.dependencia.codigo,
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( this.dependencia.dependenciaId ) {
            this.router.navigate(['/dependencias']);
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
    this.dependencia = new DependenciaModelo();
    this.dependenciaForm.reset();
    this.dependenciaForm.get('estado').setValue('A');
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

  get codigoNoValido() {
    return this.dependenciaForm.get('codigo').invalid && this.dependenciaForm.get('codigo').touched
  }

  get descripcionNoValido() {
    return this.dependenciaForm.get('descripcion').invalid && this.dependenciaForm.get('descripcion').touched
  }

  crearFormulario() {

    this.dependenciaForm = this.fb.group({
      dependenciaId  : [null, [] ],
      codigo  : [null, [ Validators.required ]  ],
      descripcion  : [null, [ Validators.required]  ],
      estado: [null, [] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],     
    });

    this.dependenciaForm.get('dependenciaId').disable();
    this.dependenciaForm.get('fechaCreacion').disable();
    this.dependenciaForm.get('fechaModificacion').disable();
    this.dependenciaForm.get('usuarioCreacion').disable();
    this.dependenciaForm.get('usuarioModificacion').disable();
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
