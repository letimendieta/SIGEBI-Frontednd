import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EnfermedadesCie10Service } from '../../../servicios/enfermedadesCie10.service';
import { EnfermedadCie10Modelo } from '../../../modelos/enfermedadCie10.modelo';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../../common/global-constants';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { DataTableDirective } from 'angular-datatables';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enfermedadesCie10',
  templateUrl: './enfermedadesCie10.component.html',
  styleUrls: ['./enfermedadesCie10.component.css']
})
export class EnfermedadesCie10Component implements OnDestroy, OnInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  dtOptions: any = {};
  dtTrigger : Subject<any> = new Subject<any>();
  
  enfermedadesCie10: EnfermedadCie10Modelo[] = [];
  buscadorForm: FormGroup;
  cargando = false;  

  constructor( private enfermedadesCie10Service: EnfermedadesCie10Service,
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
        {data:'enfermedadCie10Id'}, {data:'codigo'}, {data:'descripcion'},
        {data:'estado'}, {data:'fechaCreacion'}, {data:'usuarioCreacion'},
        {data:'fechaModificacion'}, {data:'usuarioModificacion'},
        {data:'Editar'}
      ],      
      dom: 'lBfrtip',
      buttons: [
        {
          extend:    'copy',
          text:      '<i class="far fa-copy"></i>',
          titleAttr: 'Copiar',
          className: 'btn btn-light',
          title:     'Listado de EnfermedadesCie10',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
          },
        },
        {
          extend:    'csv',
          title:     'Listado de EnfermedadesCie10',
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
          title:     'Listado de EnfermedadesCie10',
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
          title:     'ListadoEnfermedadesCie10',
          text:      '<i class="fas fa-file-pdf"></i> ',
          titleAttr: 'Exportar a PDF',
          className: 'btn btn-danger',
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]
          },
        },*/
        {
          extend:    'print',
          title:     'Listado de EnfermedadesCie10',
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

   buscadorEnfermedadesCie10(event) {
    event.preventDefault();    
    this.cargando = true;
    this.enfermedadesCie10 = [];
    this.rerender();
    var buscador = new EnfermedadCie10Modelo();
    buscador = this.buscadorForm.getRawValue();
    var orderBy = "enfermedadCie10Id";
    var orderDir = "desc";
    if( !buscador.codigo && !buscador.descripcion && !buscador.enfermedadCie10Id
      && !buscador.estado){
        buscador = null;
    }
    this.enfermedadesCie10Service.buscarEnfermedadesCie10Filtros(buscador, orderBy, orderDir)
    .subscribe( resp => {        
        this.enfermedadesCie10 = resp;        
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
    this.enfermedadesCie10 = [];    
    this.rerender();
    this.dtTrigger.next();
    
  }

  editar(event, id: number) {
    event.preventDefault();
    this.router.navigate(['enfermedadCie10', id]);
  }

  borrarEnfermedadCie10(event,enfermedadCie10: EnfermedadCie10Modelo ) {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar ${ enfermedadCie10.codigo }`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {
        let peticion: Observable<any>;
        peticion = this.enfermedadesCie10Service.borrarEnfermedadCie10( enfermedadCie10.enfermedadCie10Id );

        peticion.subscribe( resp => {
          Swal.fire({
                    icon: 'success',
                    title: enfermedadCie10.codigo,
                    text: resp.mensaje,
                  }).then( resp => {
            if ( resp.value ) {
              this.buscadorEnfermedadesCie10(event);
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
      enfermedadCie10Id  : [null, [] ],
      codigo  : [null, [] ],
      descripcion  : [null, [] ],
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
