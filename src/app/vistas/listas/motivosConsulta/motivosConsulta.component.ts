import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MotivosConsultaService } from '../../../servicios/motivosConsulta.service';
import { MotivoConsultaModelo } from '../../../modelos/motivoConsulta.modelo';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../../common/global-constants';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { DataTableDirective } from 'angular-datatables';
import { Router } from '@angular/router';

@Component({
  selector: 'app-motivosConsulta',
  templateUrl: './motivosConsulta.component.html',
  styleUrls: ['./motivosConsulta.component.css']
})
export class MotivosConsultaComponent implements OnDestroy, OnInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  dtOptions: any = {};
  dtTrigger : Subject<any> = new Subject<any>();
  
  motivosConsulta: MotivoConsultaModelo[] = [];
  buscadorForm: FormGroup;
  cargando = false;  

  constructor( private motivosConsultaService: MotivosConsultaService,
               private comunes: ComunesService,
               public router: Router,
               private fb: FormBuilder) {      
  }

  ngOnInit() {    
    this.crearFormulario();
    this.crearTabla();  
  }

  crearTabla(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      searching: false,
      language: {
        "lengthMenu": "Mostrar _MENU_ registros",
        "zeroRecords": "No se encontraron resultados",
        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sSearch": "Buscar:",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast":"Último",
          "sNext":"Siguiente",
          "sPrevious": "Anterior"
        },
        "sProcessing":"Procesando...",
        "sLengthMenu":     "Mostrar _MENU_ registros",
        "sEmptyTable":     "Ningún dato disponible en esta tabla",
        "sLoadingRecords": "Cargando..."
      },
      processing: true,
      columns: [
        {data:'#'},
        {data:'motivoConsultaId'}, {data:'codigo'}, {data:'descripcion'},
        {data:'estado'}, {data:'fechaCreacion'}, {data:'usuarioCreacion'},
        {data:'fechaModificacion'}, {data:'usuarioModificacion'},
        {data:'Editar'},
        {data:'Borrar'}
      ],      
      dom: 'lBfrtip',
      buttons: [
        {
          extend:    'copy',
          text:      '<i class="far fa-copy"></i>',
          titleAttr: 'Copiar',
          className: 'btn btn-light',
          title:     'Listado de motivosConsulta',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
          },
        },
        {
          extend:    'csv',
          title:     'Listado de motivosConsulta',
          text:      '<i class="fas fa-file-csv"></i>',
          titleAttr: 'Exportar a CSV',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
          },
        },
        {
          extend:    'excelHtml5',
          title:     'Listado de motivosConsulta',
          text:      '<i class="fas fa-file-excel"></i> ',
          titleAttr: 'Exportar a Excel',
          className: 'btn btn-light',
          autoFilter: true,
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
          }
        },
        /*{
          extend:    'pdfHtml5',
          title:     'ListadoMotivosConsulta',
          text:      '<i class="fas fa-file-pdf"></i> ',
          titleAttr: 'Exportar a PDF',
          className: 'btn btn-danger',
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
          },
        },*/
        {
          extend:    'print',
          title:     'Listado de motivosConsulta',
          text:      '<i class="fa fa-print"></i> ',
          titleAttr: 'Imprimir',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
          },
          customize: function ( win ) {
            $(win.document.body)
                .css( 'font-size', '10pt' )
                .prepend(
                    '<img src= ' + GlobalConstants.imagenReporteListas + ' style="position:absolute; top:400; left:400;" />'
                );

            $(win.document.body).find( 'table' )
                .addClass( 'compact' )
                .css( 'font-size', 'inherit' );
          }              
        }
      ]
    };
  }

   buscadorMotivosConsulta(event) {
    event.preventDefault();    
    this.cargando = true;
    this.motivosConsulta = [];
    this.rerender();
    var buscador = new MotivoConsultaModelo();
    buscador = this.buscadorForm.getRawValue(); 
    var orderBy = "motivoConsultaId";
    var orderDir = "desc";
    this.motivosConsultaService.buscarMotivosConsultaFiltros(buscador, orderBy, orderDir)
    .subscribe( resp => {        
        this.motivosConsulta = resp;        
        this.dtTrigger.next();
        this.cargando = false;
      }, e => {      
        Swal.fire({
          icon: 'info',
          title: 'Algo salió mal',
          text: this.comunes.obtenerError(e)
        })
        this.cargando = false;
        this.dtTrigger.next();
      });
  }

  limpiar(event) {
    event.preventDefault();
    this.buscadorForm.reset();
    this.motivosConsulta = [];    
    this.rerender();
    this.dtTrigger.next();
    
  }

  editar(event, id: number) {
    event.preventDefault();
    this.router.navigate(['motivoConsulta', id]);
  }

  borrarMotivoConsulta(event,motivoConsulta: MotivoConsultaModelo ) {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar ${ motivoConsulta.codigo }`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {
        let peticion: Observable<any>;
        peticion = this.motivosConsultaService.borrarMotivoConsulta( motivoConsulta.motivoConsultaId );

        peticion.subscribe( resp => {
          Swal.fire({
                    icon: 'success',
                    title: motivoConsulta.codigo,
                    text: resp.mensaje,
                  }).then( resp => {
            if ( resp.value ) {
              this.buscadorMotivosConsulta(event);
            }
          });
        }, e => {            
            Swal.fire({
              icon: 'info',
              title: 'Algo salió mal',
              text: this.comunes.obtenerError(e)
            })
          }
        );
      }
    });
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

  crearFormulario() {

    this.buscadorForm = this.fb.group({
      motivoConsultaId  : ['', [] ],
      codigo  : ['', [] ],
      descripcion  : ['', [] ],
      estado: [null, [] ]
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}
