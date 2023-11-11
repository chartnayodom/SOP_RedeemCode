package com.example.coderedeemservice.Frontend;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.notification.NotificationVariant;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.Route;
import org.springframework.web.reactive.function.client.WebClient;

@Route(value="redeemcode")
public class RedeemCodeFrontEnd extends VerticalLayout {
    public RedeemCodeFrontEnd(){


        //ห้ามแก้ =================================================================================
        TextField inputCode = new TextField("Code for Redeem", "กรอกรหัสโค้ดตรงนี้");
        Button submit = new Button("ยืนยันนอนยันตีนยันจะเอารางวัล");
        add(inputCode, submit);
        submit.addClickListener(event -> {
            String code = inputCode.getValue();
            Boolean result = WebClient.create()
                    .post()
                    .uri("http://localhost:8080//code/redeeming/" + code)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            if(result){
                Notification notification = Notification.show("คุณได้รัดีมโค้ดแล้ว");
                notification.addThemeVariants(NotificationVariant.LUMO_SUCCESS);
            }
            else{
                Notification notification = Notification.show("ไม่พบโค้ดนี้");
                notification.addThemeVariants(NotificationVariant.LUMO_ERROR);
            }

        });
        // ========================================================================================

    }
}
