$(function() {
    function MQTTViewModel(parameters) {
        var self = this;

        self.global_settings = parameters[0];

        self.showUserCredentials = ko.observable(false);
        self.showClientID = ko.observable(false);

        self.settings = undefined;
        self.availableProtocols = ko.observableArray(['MQTTv31','MQTTv311']);

        self.onBeforeBinding = function () {
            self.settings = self.global_settings.settings.plugins.mqtt;

            // show credential options if username is set
            self.showUserCredentials(!!self.settings.broker.username());

            // show client_id options if client_id is set
            self.showClientID(!!self.settings.client.client_id());

            // check connection status on load
            self.checkConnectionStatus();
        };

        self.checkConnectionStatus = function() {
            $.ajax({
                url: API_BASEURL + "plugin/mqtt",
                type: "GET",
                dataType: "json",
                success: function(response) {
                    self.updateConnectionStatus(response.connected);
                },
                error: function() {
                    self.updateConnectionStatus(false);
                }
            });
        };

        self.updateConnectionStatus = function(connected) {
            var statusElement = $("#mqtt_connection_status");
            if (connected) {
                statusElement.html('<i class="fa fa-check-circle" style="color: green;"></i> <span style="color: green;">Connected</span>');
            } else {
                statusElement.html('<i class="fa fa-times-circle" style="color: #d9534f;"></i> <span style="color: #d9534f;">Disconnected</span>');
            }
        };

        self.connectMqtt = function() {
            var button = $("#mqtt_connect_button");
            button.prop("disabled", true);
            button.html('<i class="fa fa-spinner fa-spin"></i> Connecting...');

            $.ajax({
                url: API_BASEURL + "plugin/mqtt",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "connect"
                }),
                contentType: "application/json; charset=UTF-8",
                success: function(response) {
                    if (response.connected) {
                        new PNotify({
                            title: "MQTT Connected",
                            text: "Successfully connected to MQTT broker",
                            type: "success"
                        });
                        self.updateConnectionStatus(true);
                    } else {
                        new PNotify({
                            title: "MQTT Connection",
                            text: "Connection initiated, but not yet established. Check broker settings.",
                            type: "warning"
                        });
                        self.updateConnectionStatus(false);
                    }
                },
                error: function() {
                    new PNotify({
                        title: "MQTT Connection Failed",
                        text: "Failed to connect to MQTT broker. Check logs for details.",
                        type: "error"
                    });
                    self.updateConnectionStatus(false);
                },
                complete: function() {
                    button.prop("disabled", false);
                    button.html('<i class="fa fa-link"></i> Connect');
                }
            });
        };

        self.disconnectMqtt = function() {
            var button = $("#mqtt_disconnect_button");
            button.prop("disabled", true);
            button.html('<i class="fa fa-spinner fa-spin"></i> Disconnecting...');

            $.ajax({
                url: API_BASEURL + "plugin/mqtt",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "disconnect"
                }),
                contentType: "application/json; charset=UTF-8",
                success: function(response) {
                    if (!response.connected) {
                        new PNotify({
                            title: "MQTT Disconnected",
                            text: "Successfully disconnected from MQTT broker",
                            type: "success"
                        });
                        self.updateConnectionStatus(false);
                    } else {
                        new PNotify({
                            title: "MQTT Disconnection",
                            text: "Disconnect initiated, but still showing as connected.",
                            type: "warning"
                        });
                        self.updateConnectionStatus(true);
                    }
                },
                error: function() {
                    new PNotify({
                        title: "MQTT Disconnection Failed",
                        text: "Failed to disconnect from MQTT broker. Check logs for details.",
                        type: "error"
                    });
                },
                complete: function() {
                    button.prop("disabled", false);
                    button.html('<i class="fa fa-unlink"></i> Disconnect');
                }
            });
        };
    }

    ADDITIONAL_VIEWMODELS.push([
        MQTTViewModel,
        ["settingsViewModel"],
        ["#settings_plugin_mqtt"]
    ]);
});
