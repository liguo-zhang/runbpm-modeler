'use strict';

var fs = require('fs');

var $ = require('jquery'),
    BpmnModeler = require('bpmn-js/lib/Modeler');
    
var propertiesPanelModule = require('runbpm-js-properties-panel'),
    propertiesProviderModule = require('runbpm-js-properties-panel/lib/provider/runbpm'),
    runbpmModdleDescriptor = require('runbpm-bpmn-moddle/resources/runbpm');

var container = $('#js-drop-zone');

var canvas = $('#js-canvas');

var downloadLink = $('#js-download-diagram');
var downloadSvgLink = $('#js-download-svg');

var customTranslate = {
  translate: [ 'value', require('./customTranslate/customTranslate') ]
};

var bpmnModeler = new BpmnModeler({
  container: canvas,
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    propertiesPanelModule,
    propertiesProviderModule,
    customTranslate
  ],
  moddleExtensions: {
    runbpm: runbpmModdleDescriptor
  }
});

function HTMLEncode(html) {
    var temp = document.createElement("div");
    (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
    var output = temp.innerHTML;
    temp = null;
    return output;
}

function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
}

function setSourceTab(xml){
    saveSVG(function(err, svg) {
        setEncoded(downloadSvgLink, 'runbpm_process_definition.svg', err ? null : svg);
    });
    
    setEncoded(downloadLink, 'runbpm_process_definition.xml', xml);    

  
    $('#bpmn_tab_source').html("<pre class='prettyprint linenums' >"+HTMLEncode(xml)+"</pre>");
    PR.prettyPrint();
}

var newDiagramXML = fs.readFileSync(__dirname + '/../resources/newDiagram.bpmn', 'utf-8');



function createNewDiagram() {

  openDiagram(newDiagramXML);

}

function openDiagram(xml) {

  bpmnModeler.importXML(xml, function(err) {
   
    if(err){
      console.log(err);
      
      alert("导入流程时出错，请检查文件是否合法:\n"+err);
    }else{
      setSourceTab(xml);
    }

  });
}

function saveSVG(done) {
  bpmnModeler.saveSVG(done);
}

function saveDiagram(done) {

  bpmnModeler.saveXML({ format: true }, function(err, xml) {
    done(err, xml);
  });
}

function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


////// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

$(document).on('ready', function() {

  createNewDiagram();

  $("#diagram_file").change(function(e){
     var file = e.target.files||e.dataTransfer.files;
     if(file){
        var reader = new FileReader();
        reader.onload = function(onload) {
          var xml = onload.target.result;
          openDiagram(xml);
        };
        reader.readAsText(file[0]);
     }
  });

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  $("button[id^='choose_process']").each(function(i){
     $(this).on('click',function (e) {
          
        var modelIdValue = $(this).attr('modelId');
        var url = "getProcessModelContext.jsp?isChoose=1&processModelId="+modelIdValue;
        
        $.ajax({
            type : "POST",
            url : url,
            datatype : "application/xml",
            success : function(data) {
                var xmlstr = data.xml ? data.xml : (new XMLSerializer()).serializeToString(data);
                openDiagram(xmlstr);
                choose_process_back();
                
            },
            error : function(error) {
                console.log(error);
            },
        });
     });
  });

  
  $('#deployProcessDefinition').click(function(e) {
      saveDiagram(function(err, xml) {
        var url = "ajaxSubmitHandler.jsp"; 
        var data = {"isDeployProcessDefinition":"1","deployXmlContent":xml}
        $.ajax({
           type: "POST",
           url: url,
           data: data, // serializes the form's elements.
           success: function(data)
           {
               deployProcessDefinition_back(data);
           }
         });

          e.preventDefault(); // avoid to execute the actual submit of the form.
      });

  });

  
  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

 
  var debounce = require('lodash/function/debounce');

  var exportArtifacts = debounce(function() {
    saveDiagram(function(err, xml) {
      setSourceTab(xml);
    });
  }, 500);

  bpmnModeler.on('commandStack.changed', exportArtifacts);
});
