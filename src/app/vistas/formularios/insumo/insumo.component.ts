import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { InsumosMedicosService } from '../../../servicios/insumosMedicos.service';

import Swal from 'sweetalert2';
import { ParametroModelo } from 'src/app/modelos/parametro.modelo';
import { ParametrosService } from 'src/app/servicios/parametros.service';
import { InsumoMedicoModelo } from 'src/app/modelos/insumoMedico.modelo';
import { TokenService } from 'src/app/servicios/token.service';


@Component({
  selector: 'app-insumo',
  templateUrl: './insumo.component.html',
  styleUrls: ['./insumo.component.css']
})
export class InsumoComponent implements OnInit {
  crear = false;
  insumoForm: FormGroup
  alertGuardar:boolean=false;
  listaUnidadMedida: ParametroModelo;

  constructor( private tokenService: TokenService,
               private insumosService: InsumosMedicosService,
               private parametrosService: ParametrosService,
               private route: ActivatedRoute,
               private router: Router,
               private comunes: ComunesService,
               private fb: FormBuilder ) { 
    this.crearFormulario();
    this.obtenerParametros();
  }              

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if ( id !== 'nuevo' ) {
      
      this.insumosService.getInsumo( Number(id) )
        .subscribe( (resp: InsumoMedicoModelo) => {
          this.insumoForm.patchValue(resp);
        });
    }else{
      this.crear = true;
    }
  }  

  guardar( ) {

    if ( this.insumoForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.insumoForm.controls ).forEach( control => {

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
    var insumoMedico: InsumoMedicoModelo = new InsumoMedicoModelo();
    insumoMedico = this.insumoForm.getRawValue();

    if ( insumoMedico.insumoMedicoId ) {
      //Modificar
      insumoMedico.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.insumosService.actualizarInsumoMedico( insumoMedico );
    } else {
      //Agregar
      insumoMedico.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.insumosService.crearInsumoMedico( insumoMedico);
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: insumoMedico.nombre,
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( insumoMedico.insumoMedicoId ) {
            this.router.navigate(['/insumos']);
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

  obtenerParametros() { 
    var orderBy = "descripcionValor";
    var orderDir = "asc";
    
    var unidadMedidaParam = new ParametroModelo();
    unidadMedidaParam.codigoParametro = "UNIDAD_MEDIDA";
    unidadMedidaParam.estado = "A";
    var orderBy = "descripcionValor";
    var orderDir = "asc";

    this.parametrosService.buscarParametrosFiltrosOrder( unidadMedidaParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaUnidadMedida = resp;
    });
  }

  limpiar(){
    this.insumoForm.reset();
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

  get nombreNoValido() {
    return this.insumoForm.get('nombre').invalid && this.insumoForm.get('nombre').touched
  }

  get presentacionNoValido() {
    return this.insumoForm.get('presentacion').invalid && this.insumoForm.get('presentacion').touched
  }

  get unidadMedidaNoValido() {
    return this.insumoForm.get('unidadMedida').invalid && this.insumoForm.get('unidadMedida').touched
  }

  crearFormulario() {

    this.insumoForm = this.fb.group({
      insumoMedicoId  : [null, [] ],
      codigo  : [null, []  ],
      nombre  : [null, [ Validators.required ]  ],
      caracteristicas  : [null, [ ]  ],
      compatible  : [null, [ ]  ],
      presentacion  : [null, [ Validators.required]  ],
      unidadMedida  : [null, [ Validators.required]  ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],     
    });

    this.insumoForm.get('insumoMedicoId').disable();
    this.insumoForm.get('fechaCreacion').disable();
    this.insumoForm.get('fechaModificacion').disable();
    this.insumoForm.get('usuarioCreacion').disable();
    this.insumoForm.get('usuarioModificacion').disable();
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
