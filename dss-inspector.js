(function dssInspector() {
  // Check document is ready
  if (!document.body || !document.head) {
    setTimeout( function() {
      dssInspector();
    }, 200);
    return;
  }

  // set styles
  var $ = window.jQuery,
      $body = $('body'),
      inspectorCss =  '.alert {' +
                        'margin-bottom: 5px; ' +
                        'padding: 8px 35px 8px 14px;' +
                        'text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);' +
                        'border: 1px solid #fbeed5;' +
                        'border-radius: 4px;' +
                        'background-color: #fcf8e3;' +
                        'color: #c09853;' +
                      '}' +
                      '.error {' +
                        'background-color: #f2dede;' +
                        'border-color: #eed3d7;' +
                        'color: #b94a48;' +
                      '}' +
                      '.success {' +
                        'background-color: #dff0d8;' +
                        'border-color: #d6e9c6;' +
                        'color: #468847;' +
                      '}' +
                      '.status {' +
                        'white-space: pre-wrap;' +
                      '}' +
                      '.busy:after {' +
                        'content: "Wating for metering (or it doesn\'t exist)...";' +
                      '}' +
                      '.dss_url_pattern_container.hidden .dss_inspector_url_pattern, .dss_edit_container {' +
                        'display: none;' +
                      '}' +
                      '.dss_url_pattern_container.hidden .dss_url_pattern_visibility:after {' +
                        'content: "[Show]";' +
                      '}' +
                      '.dss_url_pattern_container .dss_url_pattern_visibility {' +
                        'color: #3a87ad;' +
                      '}' +
                      '.dss_url_pattern_container .dss_url_pattern_visibility:after {' +
                        'content: "[Hide]";' +
                      '}' +
                      '.dss_inspector_title {' +
                        'color: #468847;' +
                      '}' +
                      '.refresh_time {' +
                        'display: block;' +
                      '}' +
                      '.dss_edit_container, .dss_show_container {' +
                        'width: 96%;' +
                        'margin-bottom: 10px;' +
                      '}' +
                      'textarea, .dss_show_meter {' + 
                        'display: block;' +
                        'width: 100%;' +
                        'height: 68px;' +
                        'padding: 6px 12px;' + 
                        'font-size: 14px;' +
                        'line-height: 1.428571429;' + 
                        'color: #555;' + 
                        'background-color: #fff;' + 
                        'border: 1px solid #ccc;' + 
                        'border-radius: 4px;' + 
                        '-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);' + 
                        'box-shadow: inset 0 1px 1px rgba(0,0,0,.075);' + 
                        '-webkit-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;' + 
                        'transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;' + 
                      '}',
      inspectorHtml = '<h4>Metering Status</h4><pre class="status"></pre>' +
                      '<div class="dss_inspector_activity"></div>' +
                      '<h4>Metered pages:</h4>' +
                      '<div class="dss_show_container">' +
                        '<span data-dss-inspector="editMeterPages" class="dss_show_meter"></span>' +
                        '<input type="button" data-dss-inspector="editMeterPages" value="Edit">' +
                      '</div>' +
                      '<div class="dss_edit_container">' +
                        '<textarea class="dss_edit_pages"></textarea>' +
                        '<input type="button" data-dss-inspector="updateAndEditPages" value="Update">' +
                        '<input type="button" data-dss-inspector="hideEditPages" value="Go Back">' +
                      '</div>' +
                      '<span class="refresh_time"></span>' +
                      '<h4>Quick Tools</h4>' + 
                      '<button data-dss-inspector="createUser">Generate new SSOR user</button>' +
                      '<button data-dss-inspector="killMeterModal">Kill modals</button>' +
                      '<div class="dss_generate_view"></div>';

  $('head').append('<style>' + inspectorCss + '</style>');
  $body.append(inspectorHtml);

  // attach event handling
  $(document).click( function(e) {
    var $element = $(e.target);
    $element.attr('data-dss-inspector') && handlers[$element.attr('data-dss-inspector')](e);
  });

  var ms = window && window.opener && window.opener.trb && window.opener.trb.meteringService,
      registration = window && window.opener && window.opener.registration,
      handlers = {
        createUser: function(e) {
          if (registration) {
            registration.utils.webMessage.tokenRetriever( {
              successCallback: function(data) {
                var validationToken = data.validationToken,
                    rand = (~~(Math.random() * 100000)).toString(),
                    formData = {
                      masterId    : '',
                      email       : 'ssortestuser' + rand + '@trb.com',
                      password    : 'abc1234',
                      zipcode     : rand,
                      tos         : 'true',
                      username    : 'ssortestuser' + rand
                    };
                registration.utils.webMessage.createNewAccount(validationToken, formData, {
                  successCallback: function( data ) {
                    formData.masterId = data.masterId;
                    registration.utils.webMessage.submitConsumerProfile( data.successToken, formData, {
                      successCallback: function( data ) {
                        var consumer = data.profileResponse;
                        $('.dss_generate_view').append('<p>masterId: ' + consumer.consumerId + ', username: ' + consumer.email + ', password: ' + 'abc1234</p>');
                        showAlert('Consumer created!');
                      },
                      errorCallback: function(  ){
                        showAlert('Failed to create consumer!');
                      }
                    }); //end submitConsumerProfile
                  },
                  errorCallback: function(  ){
                      showAlert('Failed to create consumer!');
                  }
                }); //end createNewAccount
              },
              errorCallback: function(  ){
                  showAlert('Failed to create consumer!');
              }
            }); //end tokenRetriever
          }
        },
        editMeterPages: function(e) {
          var $field = $('.dss_edit_pages');
          $('.dss_show_container').toggle(); // hide display
          $('.dss_edit_container').toggle();
          $field.val($('.dss_show_meter').text());
          $('').bind('click', function() {
            ms.storage.setItem(ms.storedPagesKey, ms.util.stringify($field.val().split(",")));
          });
        },
        updateAndEditPages: function(e) {
          var $field = $('.dss_edit_pages');
          ms.storage.setItem(ms.storedPagesKey, ms.util.stringify($field.val().split(",")));
          $('.dss_show_container').toggle(); // hide display
          $('.dss_edit_container').toggle();
        },
        hideEditPages: function(e) {
          $('.dss_show_container').toggle(); // hide display
          $('.dss_edit_container').toggle();
        },
        killMeterModal: function(e) {
          ms.meterData && ms.meterData[0].modals && ms.meterData[0].modals[0].destroy();
          ms.meterData[0].modals = undefined;
          ms.meterData[0].cancelStop();
          ms.dead = true;
          registration.manager.closeCurrentDialog();
        }
      };

  function checkMetering() {
    // check for metering service
    var ms = window && window.opener && window.opener.trb && window.opener.trb.meteringService;
    if (!ms) {
      // showAlert('Oh snap! Metering does not live on this page...or not yet', 'error'); //alpha
      $('.dss_inspector_activity').addClass('alert busy');
      keepChecking(2000);
      return;
    }

    ms.getStatus( function(data) {
      // showAlert('Metering status returned successfully!', 'success'); //alpha
      var formattedData = JSON.stringify(data, null, '\t');
      formattedData = formattedData.replace(/urlPattern\"\:(\s\".+\")/gi, 'urlPattern": <span class="dss_url_pattern_container hidden"><span class="dss_url_pattern_visibility"></span><span class="dss_inspector_url_pattern" >$1</span></span>');// match pattern
      formattedData = formattedData.replace(/\"(.+\"\:)/gi, '<span class="dss_inspector_title">$1').replace(/\"(\:)/gi, ':</span>'); // match titles
      updateStatus(formattedData);
      $('.refresh_time').html('Last Successful update: ' + (new Date).toString());

      $('.dss_url_pattern_visibility').click( function(e) {
        $(this).parent().toggleClass('hidden');
      });

      $('.dss_inspector_activity').removeClass('alert busy');
    });

    // We need to request a lock since its not included in getStatus call
    ms.storage.lock(ms.lockedKey, ms.lockedDateKey, (~~(Math.random()*100000000)).toString(), function() {
      ms.getStoredPages( function(pages) {
        $('.dss_show_meter').text(pages);
        ms.storage.unlock(ms.lockedKey, ms.lockedDateKey);
      });
    });


    keepChecking(4000);
  };
  checkMetering();

  function keepChecking(time, callback) {
    if (!time) {
      return;
    }
    setTimeout( function() {
      checkMetering();
    }, time);
  }
  function showAlert(msg, type) {
    $body.append('<div class="alert ' + (type ? type : '') + '">' + msg + '</div>');
  }
  function updateStatus(msg) {
    $('.status').html(msg);
  }
}());