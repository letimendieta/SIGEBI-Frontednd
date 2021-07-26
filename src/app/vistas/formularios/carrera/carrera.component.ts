import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { CarreraModelo } from '../../../modelos/carrera.modelo';
import { CarrerasService } from '../../../servicios/carreras.service';

import Swal from 'sweetalert2';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-carrera',
  templateUrl: './carrera.component.html',
  styleUrls: ['./carrera.component.css']
})
export class CarreraComponent implements OnInit {
  crear = false;
  carreraForm: FormGroup;
  alertGuardar:boolean=false;
  carrera: CarreraModelo = new CarreraModelo();

  constructor( private tokenService: TokenService,
               private carrerasService: CarrerasService,
               private route: ActivatedRoute,
               private comunes: ComunesService,
               private router: Router,
               private fb: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.carreraForm.get('estado').setValue('A');
    if ( id !== 'nuevo' ) {
      
      this.carrerasService.getCarrera( Number(id) )
        .subscribe( (resp: CarreraModelo) => {
          this.carreraForm.patchValue(resp);
        });
    }else{
      this.crear = true;
    }
  }  

  guardar( ) {

    if ( this.carreraForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.carreraForm.controls ).forEach( control => {

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

    this.carrera = this.carreraForm.getRawValue();

    if ( this.carrera.carreraId ) {
      //Modificar
      this.carrera.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.carrerasService.actualizarCarrera( this.carrera );
    } else {
      //Agregar
      this.carrera.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.carrerasService.crearCarrera( this.carrera );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: this.carrera.codigo,
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( this.carrera.carreraId ) {
            this.router.navigate(['/carreras']);
          }else{
            this.limpiar();
          }
        }

      });
    }, e => {Swal.fire({
              icon: 'error',
              title: 'Algo salió mal',
              text: e.status +'. '+ this.comunes.obtenerError(e),
            })
       }
    );
  }

  limpiar(){
    this.carrera = new CarreraModelo();
    this.carreraForm.reset();
    this.carreraForm.get('estado').setValue('A');
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
    return this.carreraForm.get('codigo').invalid && this.carreraForm.get('codigo').touched
  }

  get descripcionNoValido() {
    return this.carreraForm.get('descripcion').invalid && this.carreraForm.get('descripcion').touched
  }

  crearFormulario() {

    this.carreraForm = this.fb.group({
      carreraId  : [null, [] ],
      codigo  : [null, [ Validators.required ]  ],
      descripcion  : [null, [ Validators.required]  ],
      estado: [null, [Validators.required] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],     
    });

    this.carreraForm.get('carreraId').disable();
    this.carreraForm.get('fechaCreacion').disable();
    this.carreraForm.get('fechaModificacion').disable();
    this.carreraForm.get('usuarioCreacion').disable();
    this.carreraForm.get('usuarioModificacion').disable();
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
