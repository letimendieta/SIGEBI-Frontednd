import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { MedicamentosService } from '../../../servicios/medicamentos.service';

import Swal from 'sweetalert2';
import { ParametroModelo } from 'src/app/modelos/parametro.modelo';
import { ParametrosService } from 'src/app/servicios/parametros.service';
import { MedicamentoModelo } from 'src/app/modelos/medicamento.modelo';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-medicamento',
  templateUrl: './medicamento.component.html',
  styleUrls: ['./medicamento.component.css']
})
export class MedicamentoComponent implements OnInit {
  crear = false;
  medicamentoForm: FormGroup;
  alertGuardar:boolean=false;
  listaUnidadMedida: ParametroModelo;
  opcion = "";

  constructor( private tokenService: TokenService,
               private medicamentosService: MedicamentosService,
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
      
      this.medicamentosService.getMedicamento( Number(id) )
        .subscribe( (resp: MedicamentoModelo) => {
          this.medicamentoForm.patchValue(resp);
        });
    }else{
      this.crear = true;
      this.opcion = 'med';
    }
  }  

  guardarMedicamento( ) {
    this.cerrarAlertGuardar();
    if ( this.medicamentoForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.medicamentoForm.controls ).forEach( control => {

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
    var medicamento: MedicamentoModelo = new MedicamentoModelo();
    medicamento = this.medicamentoForm.getRawValue();

    if ( medicamento.medicamentoId ) {
      //Modificar
      medicamento.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.medicamentosService.actualizarMedicamento( medicamento );
    } else {
      //Agregar
      medicamento.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.medicamentosService.crearMedicamento( medicamento);
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: medicamento.medicamento,
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( resp.value.medicamentoId ) {
            this.router.navigate(['/medicamentos']);
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
    this.medicamentoForm.reset();
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

  get medicamentoNoValido() {
    return this.medicamentoForm.get('medicamento').invalid && this.medicamentoForm.get('medicamento').touched
  }

  get concentracionNoValido() {
    return this.medicamentoForm.get('concentracion').invalid && this.medicamentoForm.get('concentracion').touched
  }

  get formaNoValido() {
    return this.medicamentoForm.get('forma').invalid && this.medicamentoForm.get('forma').touched
  }

  get viaAdminNoValido() {
    return this.medicamentoForm.get('viaAdmin').invalid && this.medicamentoForm.get('viaAdmin').touched
  }

  get presentacionMedicamentoNoValido() {
    return this.medicamentoForm.get('presentacion').invalid && this.medicamentoForm.get('presentacion').touched
  }

  crearFormulario() {
   
    this.medicamentoForm = this.fb.group({
      medicamentoId  : [null, [] ],
      codigo  : [null, []  ],
      medicamento  : [null, [ Validators.required ]  ],
      concentracion  : [null, [Validators.required ]  ],
      forma  : [null, [Validators.required ]  ],
      viaAdmin  : [null, [ Validators.required]  ],
      presentacion  : [null, [ Validators.required]  ],
      clasifATQ: [null, [ ]  ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],     
    });

    this.medicamentoForm.get('medicamentoId').disable();
    this.medicamentoForm.get('fechaCreacion').disable();
    this.medicamentoForm.get('fechaModificacion').disable();
    this.medicamentoForm.get('usuarioCreacion').disable();
    this.medicamentoForm.get('usuarioModificacion').disable();
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
