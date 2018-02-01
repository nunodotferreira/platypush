$(document).ready(function() {
    var seekInterval;
    var curTrackElapsed = {
        timestamp: null,
        elapsed: null,
    };

    var execute = function(request, onSuccess, onError, onComplete) {
        request['target'] = 'localhost';
        $.ajax({
            type: 'POST',
            url: '/execute',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(request),
            complete: function() {
                if (onComplete) {
                    onComplete();
                }
            },
            error: function(xhr, status, error) {
                if (onError) {
                    onError(xhr, status, error);
                }
            },
            success: function(response, status, xhr) {
                if (onSuccess) {
                    onSuccess(response, status, xhr);
                }
            },
            beforeSend: function(xhr) {
                if (window.token) {
                    xhr.setRequestHeader('X-Token', window.token);
                }
            },
        });
    };

    var updateControls = function(status, track) {
        var $playbackControls = $('.playback-controls');
        var $curTrack = $('.track-info');
        var $volumeCtrl = $('#volume-ctrl');
        var $trackSeeker = $('#track-seeker');
        var $randomBtn = $playbackControls.find('[data-action=random]');
        var $repeatBtn = $playbackControls.find('[data-action=repeat]');
        var elapsed; var length;

        if (status) {
            if (seekInterval) {
                clearInterval(seekInterval);
            }

            if ('time' in status) {
                var time = status.time.split(':');
                elapsed = parseInt(parseInt(time[0])/60) + ':'
                    + (parseInt(time[0])%60 < 10 ? '0' : '') + (parseInt(time[0])%60);

                if (time.length > 1) {
                    length = parseInt(parseInt(time[1])/60) + ':'
                        + (parseInt(time[1])%60 < 10 ? '0' : '') + (parseInt(time[1])%60);
                }

                $trackSeeker.val(parseInt(time[0]));
                $trackSeeker.attr('max', parseInt(time[1]));
                curTrackElapsed = {
                    timestamp: new Date().getTime(),
                    elapsed: parseInt(time[0]),
                };
            }

            switch (status.state.toLowerCase()) {
                case 'stop':
                    $playbackControls.find('button[data-action=pause]').hide();
                    $playbackControls.find('button[data-action=play]').show();
                    $curTrack.find('.artist').hide();
                    $curTrack.find('.track').hide();
                    $curTrack.find('.no-track').show();

                    $trackSeeker.attr('disabled', true);
                    $('.seek-time').text('-:--');
                    break;

                case 'pause':
                    $playbackControls.find('button[data-action=pause]').hide();
                    $playbackControls.find('button[data-action=play]').show();
                    $curTrack.find('.artist').show();
                    $curTrack.find('.track').show();
                    $curTrack.find('.no-track').hide();

                    $trackSeeker.removeAttr('disabled');
                    $('#seek-time-elapsed').text(elapsed ? elapsed : '-:--');
                    $('#seek-time-length').text(length ? length : '-:--');
                    break;

                case 'play':
                    $playbackControls.find('button[data-action=pause]').show();
                    $playbackControls.find('button[data-action=play]').hide();
                    $curTrack.find('.artist').show();
                    $curTrack.find('.track').show();
                    $curTrack.find('.no-track').hide();

                    $trackSeeker.removeAttr('disabled');
                    $('#seek-time-elapsed').text(elapsed ? elapsed : '-:--');
                    $('#seek-time-length').text(length ? length : '-:--');

                    seekInterval = setInterval(function() {
                        var length = parseInt($trackSeeker.attr('max'));
                        var value = parseInt((new Date().getTime() - curTrackElapsed.timestamp)/1000)
                            + curTrackElapsed.elapsed;

                        if (value < length) {
                            $trackSeeker.val(value);
                            elapsed = parseInt(value/60) + ':' + (value%60 < 10 ? '0' : '') + (value%60);
                            $('#seek-time-elapsed').text(elapsed);
                        }
                    }, 1000);
                    break;
            }

            $volumeCtrl.val(parseInt(status.volume));

            var repeat = parseInt(status.repeat);
            if (repeat) {
                $repeatBtn.addClass('enabled');
            } else {
                $repeatBtn.removeClass('enabled');
            }

            var random = parseInt(status.random);
            if (random) {
                $randomBtn.addClass('enabled');
            } else {
                $randomBtn.removeClass('enabled');
            }
        }

        if (track) {
            $curTrack.find('.artist').text(track.artist);
            $curTrack.find('.track').text(track.title);
        }
    };

    var onEvent = function(event) {
        if (
                event.args.type === 'platypush.message.event.music.MusicStopEvent' ||
                event.args.type === 'platypush.message.event.music.MusicPlayEvent' ||
                event.args.type === 'platypush.message.event.music.MusicPauseEvent' ||
                event.args.type === 'platypush.message.event.music.NewPlayingTrackEvent') {
            updateControls(status=event.args.status, track=event.args.track);
        }

        console.log(event);
    };

    var initStatus = function() {
        execute(
            {
                type: 'request',
                action: 'music.mpd.status',
            },

            onSuccess = function(response) {
                updateControls(status=response.response.output);
            }
        );

        execute(
            {
                type: 'request',
                action: 'music.mpd.currentsong',
            },

            onSuccess = function(response) {
                updateControls(status=undefined, track=response.response.output);
            }
        );
    };

    var initPlaylist = function() {
        execute(
            {
                type: 'request',
                action: 'music.mpd.playlistinfo',
            },

            onSuccess = function(response) {
                var $playlistContent = $('#playlist-content');
                var tracks = response.response.output;

                for (var track of tracks) {
                    var $element = $('<div></div>')
                        .addClass('playlist-track')
                        .addClass('row').addClass('music-item')
                        .data('file', track.file);

                    var $artist = $('<div></div>')
                        .addClass('four').addClass('columns')
                        .addClass('track-artist').text(track.artist);

                    var $title = $('<div></div>')
                        .addClass('six').addClass('columns')
                        .addClass('track-title').text(track.title);

                    var $time = $('<div></div>')
                        .addClass('two').addClass('columns')
                        .addClass('track-time').text(
                            '' + parseInt(parseInt(track.time)/60) +
                            ':' + (parseInt(track.time)%60 < 10 ? '0' : '') +
                            parseInt(track.time)%60);

                    $artist.appendTo($element);
                    $title.appendTo($element);
                    $time.appendTo($element);
                    $element.appendTo($playlistContent);
                }
            }
        );
    };

    var initBrowser = function() {
        execute(
            {
                type: 'request',
                action: 'music.mpd.lsinfo',
            },

            onSuccess = function(response) {
                var $browserContent = $('#music-browser');
                var items = response.response.output;
                var directories = [];
                var playlists = [];

                for (var item of items) {
                    if ('directory' in item) {
                        directories.push(item.directory);
                    } else if ('playlist' in item) {
                        playlists.push(item.playlist);
                    }
                }

                for (var directory of directories.sort()) {
                    var $element = $('<div></div>')
                        .addClass('browser-directory').addClass('music-item')
                        .addClass('browser-item').addClass('row')
                        .html('<i class="fa fa-folder-open-o"></i> &nbsp; ' + directory);

                    $element.appendTo($browserContent);
                }

                for (var playlist of playlists.sort()) {
                    var $element = $('<div></div>')
                        .addClass('browser-playlist').addClass('music-item')
                        .addClass('browser-item').addClass('row')
                        .html('<i class="fa fa-music"></i> &nbsp; ' + playlist);

                    $element.appendTo($browserContent);
                }
            }
        );
    };

    var initBindings = function() {
        window.registerEventListener(onEvent);
        var $playbackControls = $('.playback-controls').find('button');
        var $volumeCtrl = $('#volume-ctrl');
        var $trackSeeker = $('#track-seeker');
        var prevVolume;

        $playbackControls.on('click', function(evt) {
            var action = $(this).data('action');
            var $btn = $(this);
            $btn.attr('disabled', true);

            execute(
                {
                    type: 'request',
                    action: 'music.mpd.' + action,
                },

                onSuccess = function(response) {
                    updateControls(status=response.response.output);
                },

                onError=undefined,
                onComplete = function() {
                    $btn.removeAttr('disabled');
                }
            );
        });

        $volumeCtrl.on('mousedown', function(event) {
            prevVolume = $(this).val();
        });

        $volumeCtrl.on('mouseup', function(event) {
            execute(
                {
                    type: 'request',
                    action: 'music.mpd.setvol',
                    args: { vol: $(this).val() }
                },

                onSuccess=undefined,
                onError = function() {
                    $volumeCtrl.val(prevVolume);
                }
            );
        });

        $volumeCtrl.on('mouseup', function(event) {
            execute(
                {
                    type: 'request',
                    action: 'music.mpd.setvol',
                    args: { vol: $(this).val() }
                },

                onSuccess=undefined,
                onError = function() {
                    $volumeCtrl.val(prevVolume);
                }
            );
        });

        $trackSeeker.on('mouseup', function(event) {
            execute(
                {
                    type: 'request',
                    action: 'music.mpd.seekcur',
                    args: { value: $(this).val() }
                },

                onSuccess = function(response) {
                    var elapsed = parseInt(response.response.output.time.split(':')[0]);
                    curTrackElapsed.elapsed = elapsed;
                }
            );
        });
    };

    var init = function() {
        initStatus();
        initPlaylist();
        initBrowser();
        initBindings();
    };

    init();
});
