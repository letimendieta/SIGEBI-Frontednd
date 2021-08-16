import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AreaModelo } from '../../../modelos/area.modelo';
import { AreasService } from '../../../servicios/areas.service';
import { ComunesService } from 'src/app/servicios/comunes.service';
import Swal from 'sweetalert2';
import { ParametroModelo } from 'src/app/modelos/parametro.modelo';
import { ParametrosService } from 'src/app/servicios/parametros.service';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css']
})
export class AreaComponent implements OnInit {
  crear = false;
  areaForm: FormGroup;
  alertGuardar:boolean=false;
  listaTipos: ParametroModelo;

  constructor( private tokenService: TokenService,
               private areasService: AreasService,
               private parametrosService: ParametrosService,
               private route: ActivatedRoute,
               private comunes: ComunesService,
               private router: Router,
               private fb: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.areaForm.get('estado').setValue('A');
    this.obtenerParametros();
    if ( id !== 'nuevo' ) {
      
      this.areasService.getArea( Number(id) )
        .subscribe( (resp: AreaModelo) => {
          this.areaForm.patchValue(resp);
        });
    }else{
      this.crear = true;
    }
  }  

  obtenerParametros() {
    var tipoAreaParam = new ParametroModelo();
    tipoAreaParam.codigoParametro = "TIPO_AREA";
    tipoAreaParam.estado = "A";
    var orderBy = "descripcionValor";
    var orderDir = "asc";

    this.parametrosService.buscarParametrosFiltrosOrder( tipoAreaParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaTipos = resp;
    });
  }

  guardar( ) {

    if ( this.areaForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.areaForm.controls ).forEach( control => {

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

    var area = new AreaModelo();

    let peticion: Observable<any>;

    area = this.areaForm.getRawValue();

    if ( area.areaId ) {
      //Modificar
      area.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.areasService.actualizarArea( area );
    } else {
      //Agregar
      area.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.areasService.crearArea( area );
    }

    peticion.subscribe( response => {

      Swal.fire({
                icon: 'success',
                title: response.area.codigo,
                text: response.mensaje
              }).then( resp => {

        if ( resp.value ) {
          if ( response.area.areaId ) {
            this.router.navigate(['/areas']);
          }else{
            this.limpiar();
          }
        }
      });
    }, e => {Swal.fire({
              icon: 'error',
              title: 'Algo salió mal',
              text: this.comunes.obtenerError(e)
            })
       }
    );
  }

  limpiar(){
    this.areaForm.reset();
    this.areaForm.get('estado').setValue('A');
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
    return this.areaForm.get('codigo').invalid && this.areaForm.get('codigo').touched
  }

  get descripcionNoValido() {
    return this.areaForm.get('descripcion').invalid && this.areaForm.get('descripcion').touched
  }

  get tipoNoValido() {
    return this.areaForm.get('tipo').invalid && this.areaForm.get('tipo').touched
  }

  crearFormulario() {

    this.areaForm = this.fb.group({
      areaId  : [null, [] ],
      codigo  : [null, [ Validators.required ]  ],
      descripcion  : [null, [ Validators.required]  ],
      tipo  : [null, [ Validators.required]  ],
      estado: [null, [] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],     
    });

    this.areaForm.get('areaId').disable();
    this.areaForm.get('fechaCreacion').disable();
    this.areaForm.get('fechaModificacion').disable();
    this.areaForm.get('usuarioCreacion').disable();
    this.areaForm.get('usuarioModificacion').disable();
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
