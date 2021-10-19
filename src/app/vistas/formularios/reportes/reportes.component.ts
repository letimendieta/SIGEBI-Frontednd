import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Reporte2Modelo } from '../../../modelos/reporte2.modelo';
import { ReportesService } from '../../../servicios/reportes.service';
import { ComunesService } from '../../../servicios/comunes.service';
import Swal from 'sweetalert2';
import { AreasService } from 'src/app/servicios/areas.service';
import { AreaModelo } from 'src/app/modelos/area.modelo';
import { GlobalConstants } from 'src/app/common/global-constants';

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
  listaAreas: AreaModelo;

  constructor( private reportesService: ReportesService,
               private comunes: ComunesService,
               private areasService: AreasService,
               private fb: FormBuilder,
               private fb2: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {    
    this.crear = true;
    this.listarAreas();    
  }  

  listarAreas() {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var area = new AreaModelo();
    area.estado = "A";
    
    area.tipo = GlobalConstants.TIPO_AREA_SERVICIO;
    
    this.areasService.buscarAreasFiltrosOrder(area, orderBy, orderDir )
      .subscribe( (resp: AreaModelo) => {
        this.listaAreas = resp;
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
        if ( resp.value ) {     
            this.limpiar();
        }
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
    this.cerrarAlertGuardar();
    if ( this.reporteForm2.invalid ) {
      this.alertGuardar = true;
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
        if ( resp.value ) {     
            this.limpiar();
        }
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
      mes  : [null, [Validators.required] ],      
      anho: [null, [Validators.required] ]
    });

    this.reporteForm2 = this.fb2.group({
      mes  : [null, [Validators.required] ],      
      anho: [null, [Validators.required] ]
    });
  }

  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }  
}
