import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { MotivoConsultaModelo } from '../../../modelos/motivoConsulta.modelo';
import { MotivosConsultaService } from '../../../servicios/motivosConsulta.service';
import { ComunesService } from 'src/app/servicios/comunes.service';
import Swal from 'sweetalert2';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-motivoConsulta',
  templateUrl: './motivoConsulta.component.html',
  styleUrls: ['./motivoConsulta.component.css']
})
export class MotivoConsultaComponent implements OnInit {
  crear = false;
  motivoConsultaForm: FormGroup;
  alertGuardar:boolean=false;
  motivoConsulta: MotivoConsultaModelo = new MotivoConsultaModelo();

  constructor( private tokenService: TokenService,
               private motivosConsultaService: MotivosConsultaService,
               private route: ActivatedRoute,
               private comunes: ComunesService,
               private router: Router,
               private fb: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.motivoConsultaForm.get('estado').setValue('A');
    if ( id !== 'nuevo' ) {
      
      this.motivosConsultaService.getMotivoConsulta( Number(id) )
        .subscribe( (resp: MotivoConsultaModelo) => {
          this.motivoConsultaForm.patchValue(resp);
        });
    }else{
      this.crear = true;
    }
  }  

  guardar( ) {
    this.cerrarAlertGuardar();
    if ( this.motivoConsultaForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.motivoConsultaForm.controls ).forEach( control => {

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

    this.motivoConsulta = this.motivoConsultaForm.getRawValue();

    if ( this.motivoConsulta.motivoConsultaId ) {
      //Modificar
      this.motivoConsulta.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.motivosConsultaService.actualizarMotivoConsulta( this.motivoConsulta );
    } else {
      //Agregar
      this.motivoConsulta.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.motivosConsultaService.crearMotivoConsulta( this.motivoConsulta );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: resp.motivoConsulta.codigo,
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( this.motivoConsulta.motivoConsultaId ) {
            this.router.navigate(['/motivosConsulta']);
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
    this.motivoConsulta = new MotivoConsultaModelo();
    this.motivoConsultaForm.reset();
    this.motivoConsultaForm.get('estado').setValue('A');
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
    return this.motivoConsultaForm.get('codigo').invalid && this.motivoConsultaForm.get('codigo').touched
  }

  get descripcionNoValido() {
    return this.motivoConsultaForm.get('descripcion').invalid && this.motivoConsultaForm.get('descripcion').touched
  }

  crearFormulario() {

    this.motivoConsultaForm = this.fb.group({
      motivoConsultaId  : [null, [] ],
      codigo  : [null, [ Validators.required ]  ],
      descripcion  : [null, [ Validators.required]  ],
      estado: [null, [] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],     
    });

    this.motivoConsultaForm.get('motivoConsultaId').disable();
    this.motivoConsultaForm.get('fechaCreacion').disable();
    this.motivoConsultaForm.get('fechaModificacion').disable();
    this.motivoConsultaForm.get('usuarioCreacion').disable();
    this.motivoConsultaForm.get('usuarioModificacion').disable();
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
