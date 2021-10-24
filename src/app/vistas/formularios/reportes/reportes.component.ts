import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Reporte2Modelo } from '../../../modelos/reporte2.modelo';
import { ReportesService } from '../../../servicios/reportes.service';
import { ComunesService } from '../../../servicios/comunes.service';
import Swal from 'sweetalert2';
import { AreasService } from 'src/app/servicios/areas.service';
import { AreaModelo } from 'src/app/modelos/area.modelo';
import { GlobalConstants } from 'src/app/common/global-constants';
import { ParametroModelo } from 'src/app/modelos/parametro.modelo';
import { ParametrosService } from 'src/app/servicios/parametros.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  crear = false;
  reporteForm: FormGroup;
  reporteForm2: FormGroup;
  alertGuardar:boolean=false;
  alertGuardar2:boolean=false;
  listaAnhos: string[];

  constructor( private reportesService: ReportesService,
               private comunes: ComunesService,
               private parametrosService: ParametrosService,
               private fb: FormBuilder,
               private fb2: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {    
    this.crear = true;
    this.obtenerParametros();    
  }  

  obtenerParametros() {
    var estadoCivilParam = new ParametroModelo();
    estadoCivilParam.codigoParametro = "ANHOS_REPORTE";
    estadoCivilParam.estado = "A";
    var orderBy = "descripcionValor";
    var orderDir = "asc";

    this.parametrosService.buscarParametrosFiltrosOrder( estadoCivilParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo[]) => {
        this.listaAnhos = resp[0].valor.split(",");
    });
  }

  guardar( ) {
    this.cerrarAlertGuardar();
    if ( this.reporteForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.reporteForm.controls ).forEach( control => {

        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }
    
    var reporte = new Reporte2Modelo();

    reporte = this.reporteForm.getRawValue();

    Swal.fire({
      title: 'Espere',
      text: 'Generando reporte',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.reportesService.generarReporte(reporte).subscribe(
      data => {
        Swal.fire({
          icon: 'success',
          title: 'Reporte ',
          text: 'reporte generado'
        }).then( resp => {
          const file = new Blob([data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);        
      });  
      }, e => {      
        Swal.fire({
          icon: 'info',
          title: 'Algo salió mal',
          text: this.comunes.obtenerError(e)
        })
      });
  }

  guardarInformeMensual( ) {
    this.cerrarAlertGuardar2();
    if ( this.reporteForm2.invalid ) {
      this.alertGuardar2 = true;
      return Object.values( this.reporteForm2.controls ).forEach( control => {

        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }
    
    var reporte = new Reporte2Modelo();

    reporte = this.reporteForm2.getRawValue();

    Swal.fire({
      title: 'Espere',
      text: 'Generando reporte',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.reportesService.generarReporteMensual(reporte).subscribe(
      data => {
        Swal.fire({
          icon: 'success',
          title: 'Reporte ',
          text: 'reporte generado'
        }).then( resp => {
          const file = new Blob([data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);        
      });  
      }, e => {      
        Swal.fire({
          icon: 'info',
          title: 'Algo salió mal',
          text: this.comunes.obtenerError(e)
        })
      });
  }

  limpiar(){
    this.reporteForm.reset();    
  }

  get areaNoValido() {
    return this.reporteForm2.get('areas').get('areaId').invalid 
    && this.reporteForm2.get('areas').get('areaId').touched
  }
  
  crearFormulario() {
    this.reporteForm = this.fb.group({
      mes  : ['', [Validators.required] ],      
      anho: ['', [Validators.required] ]
    });

    this.reporteForm2 = this.fb2.group({
      mes  : ['', [Validators.required] ],      
      anho: ['', [Validators.required] ]
    });
  }

  get anhoNoValido() {
    return this.reporteForm.get('anho').invalid && this.reporteForm.get('anho').touched
  }

  get anhoNoValido2() {
    return this.reporteForm2.get('anho').invalid && this.reporteForm2.get('anho').touched
  }

  get mesNoValido() {
    return this.reporteForm.get('mes').invalid && this.reporteForm.get('mes').touched
  }

  get mes2NoValido() {
    return this.reporteForm2.get('mes').invalid && this.reporteForm2.get('mes').touched
  }

  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }

  cerrarAlertGuardar2(){
    this.alertGuardar2=false;
  } 
}
