import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { EstamentoModelo } from '../../../modelos/estamento.modelo';
import { EstamentosService } from '../../../servicios/estamentos.service';

import Swal from 'sweetalert2';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-estamento',
  templateUrl: './estamento.component.html',
  styleUrls: ['./estamento.component.css']
})
export class EstamentoComponent implements OnInit {
  crear = false;
  estamentoForm: FormGroup;
  alertGuardar:boolean=false;
  estamento: EstamentoModelo = new EstamentoModelo();

  constructor( private tokenService: TokenService,
               private estamentosService: EstamentosService,
               private route: ActivatedRoute,
               private router: Router,
               private comunes: ComunesService,
               private fb: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.estamentoForm.get('estado').setValue('A');
    if ( id !== 'nuevo' ) {
      
      this.estamentosService.getEstamento( Number(id) )
        .subscribe( (resp: EstamentoModelo) => {
          this.estamentoForm.patchValue(resp);
        });
    }else{
      this.crear = true;
    }
  }  

  guardar( ) {
    this.cerrarAlertGuardar();
    if ( this.estamentoForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.estamentoForm.controls ).forEach( control => {

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

    this.estamento = this.estamentoForm.getRawValue();

    if ( this.estamento.estamentoId ) {
      //Modificar
      this.estamento.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.estamentosService.actualizarEstamento( this.estamento );
    } else {
      //Agregar
      this.estamento.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.estamentosService.crearEstamento( this.estamento );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: this.estamento.codigo,
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( this.estamento.estamentoId ) {
            this.router.navigate(['/estamentos']);
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
    this.estamento = new EstamentoModelo();
    this.estamentoForm.reset();
    this.estamentoForm.get('estado').setValue('A');
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
    return this.estamentoForm.get('codigo').invalid && this.estamentoForm.get('codigo').touched
  }

  get descripcionNoValido() {
    return this.estamentoForm.get('descripcion').invalid && this.estamentoForm.get('descripcion').touched
  }

  crearFormulario() {

    this.estamentoForm = this.fb.group({
      estamentoId  : [null, [] ],
      codigo  : [null, [ Validators.required ]  ],
      descripcion  : [null, [ Validators.required]  ],
      estado: [null, [] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],     
    });

    this.estamentoForm.get('estamentoId').disable();
    this.estamentoForm.get('fechaCreacion').disable();
    this.estamentoForm.get('fechaModificacion').disable();
    this.estamentoForm.get('usuarioCreacion').disable();
    this.estamentoForm.get('usuarioModificacion').disable();
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
