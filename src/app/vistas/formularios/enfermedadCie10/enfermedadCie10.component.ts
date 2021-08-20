import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { EnfermedadCie10Modelo } from '../../../modelos/enfermedadCie10.modelo';
import { EnfermedadesCie10Service } from '../../../servicios/enfermedadesCie10.service';
import { ComunesService } from 'src/app/servicios/comunes.service';
import Swal from 'sweetalert2';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-enfermedadCie10',
  templateUrl: './enfermedadCie10.component.html',
  styleUrls: ['./enfermedadCie10.component.css']
})
export class EnfermedadCie10Component implements OnInit {
  crear = false;
  enfermedadCie10Form: FormGroup;
  alertGuardar:boolean=false;
  enfermedadCie10: EnfermedadCie10Modelo = new EnfermedadCie10Modelo();

  constructor( private tokenService: TokenService,
               private enfermedadesCie10Service: EnfermedadesCie10Service,
               private route: ActivatedRoute,
               private comunes: ComunesService,
               private router: Router,
               private fb: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.enfermedadCie10Form.get('estado').setValue('A');
    if ( id !== 'nuevo' ) {
      
      this.enfermedadesCie10Service.getEnfermedadCie10( Number(id) )
        .subscribe( (resp: EnfermedadCie10Modelo) => {
          this.enfermedadCie10Form.patchValue(resp);
        });
    }else{
      this.crear = true;
    }
  }  

  guardar( ) {
    this.cerrarAlertGuardar();
    if ( this.enfermedadCie10Form.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.enfermedadCie10Form.controls ).forEach( control => {

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

    this.enfermedadCie10 = this.enfermedadCie10Form.getRawValue();

    if ( this.enfermedadCie10.enfermedadCie10Id ) {
      //Modificar
      this.enfermedadCie10.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.enfermedadesCie10Service.actualizarEnfermedadCie10( this.enfermedadCie10 );
    } else {
      //Agregar
      this.enfermedadCie10.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.enfermedadesCie10Service.crearEnfermedadCie10( this.enfermedadCie10 );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: this.enfermedadCie10.codigo,
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( this.enfermedadCie10.enfermedadCie10Id ) {
            this.router.navigate(['/enfermedadesCie10']);
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
    this.enfermedadCie10 = new EnfermedadCie10Modelo();
    this.enfermedadCie10Form.reset();
    this.enfermedadCie10Form.get('estado').setValue('A');
  }

  obtenerError(e : any){
    var mensaje = "Error indefinido ";
      if(e.error){
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
      }
      if(e.message){
        mensaje = mensaje + ' ' + e.message;
      }
    return mensaje;  
  }

  get codigoNoValido() {
    return this.enfermedadCie10Form.get('codigo').invalid && this.enfermedadCie10Form.get('codigo').touched
  }

  get descripcionNoValido() {
    return this.enfermedadCie10Form.get('descripcion').invalid && this.enfermedadCie10Form.get('descripcion').touched
  }

  crearFormulario() {

    this.enfermedadCie10Form = this.fb.group({
      enfermedadCie10Id  : [null, [] ],
      codigo  : [null, [ Validators.required ]  ],
      descripcion  : [null, [ Validators.required]  ],
      estado: [null, [] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],     
    });

    this.enfermedadCie10Form.get('enfermedadCie10Id').disable();
    this.enfermedadCie10Form.get('fechaCreacion').disable();
    this.enfermedadCie10Form.get('fechaModificacion').disable();
    this.enfermedadCie10Form.get('usuarioCreacion').disable();
    this.enfermedadCie10Form.get('usuarioModificacion').disable();
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
