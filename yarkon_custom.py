@json_restful
def yarkon_file_share_link():

    def POST(**vars):
        try:
            params = json.loads(request.vars.get('Share_file_details'))
            number_of_selected_files = str(params.get('No_of_Selected_Files')) + " " + "Files"
            selected_files_to_share = json.loads(request.vars.get('Share_file_details'))['Selected_Files_to_Share']

            guest_name = params.get('share_Name')
            guest_email = params.get('share_Email')

            hour_expire = params.get('hour_Expire') + " Hours"
            sec_expire = int(params.get('hour_Expire'))*60*60
            hours = int(params.get('hour_Expire'))
            sending_time = datetime.utcnow()
            hours_added_for_expiration_time = timedelta(hours=hours)
            expiration_time = sending_time + hours_added_for_expiration_time
            expiration_time = json.dumps(expiration_time, default=str)

            aws_region = params.get('aws_Region')

            files_details_list = []

            for File in selected_files_to_share:
                file_name = File.get('title')
                file_id = File.get('id')
                file_size = File.get('size')
                bucket = file_id.split("/")[0]
                file_key = File.get('key')

                guest_file_link_url = get_presign_url_for_download(aws_region, bucket, file_key, sec_expire)
                guest_file_link_url = guest_file_link_url.replace('&', '^')  # Because of URL misbehave

                file_details = {'file_name': file_name,
                                'guest_file_link_url': guest_file_link_url,
                                'file_size': file_size}

                files_details_list.append(file_details)

            user_first_name = auth.user.first_name
            user_last_name = auth.user.last_name
            current_year = str(datetime.now().year)
            current_month = str(datetime.now().month)
            current_date = date.today().strftime("%B %d, %Y")

            user_filter_record = db(db.yarkon_files_share.user_id == auth.user.id).select(db.yarkon_files_share.ALL).last()

            if user_filter_record is None:
                total_number_of_files_shared = int(params.get('No_of_Selected_Files'))
                unique_key = str(uuid.uuid4().hex[:7].upper()) + str(total_number_of_files_shared)
                
            else:
                total_number_of_files_shared = user_filter_record.total_number_of_files_shared + int(params.get('No_of_Selected_Files'))
                unique_key = str(uuid.uuid4().hex[:7].upper()) + str(total_number_of_files_shared)

            yarkon_file_share = YarkonFileShare(user_id=auth.user.id,
                                                files_url=json.dumps(files_details_list),
                                                last_number_of_files_shared=int(params.get('No_of_Selected_Files')),
                                                total_number_of_files_shared=total_number_of_files_shared,
                                                guest_user_name=guest_name,
                                                guest_user_email=guest_email,
                                                unique_key=unique_key
                                                )
            YarkonFilesShare().create(db, yarkon_file_share)

            controller_function = "/default/yarkon_custom_download"
            query_string = {'expiration_time': expiration_time, 'unique_key': unique_key}
            # qs_1 = json.dumps(query_string['file_details'])selected_files_to_share
            qs_1 = query_string['expiration_time']
            qs_2 = json.dumps(auth.user.company)
            qs_3 = json.dumps(query_string['unique_key'])

            file_link_url = AWS_URL + controller_function + "?expiration_time=" + qs_1 + "&user_company=" + qs_2 + "&unique_key=" + qs_3

            email_template = EmailTemplate(template_type=EmailTemplates.FileShareEmail,
                                           f_name=user_first_name, l_name=user_last_name, file_link_name=guest_name,
                                           file_link_email=guest_email, name_of_file=number_of_selected_files,
                                           file_link_date_day=current_date, file_link_date_month=current_month,
                                           file_link_date_year=current_year, file_link_time=hour_expire,
                                           file_link_url=file_link_url)

            email_template.email_send()
            print "Email sent for file share link"
            return {'status': True, 'Name': guest_name, 'Email': guest_email}

        except Exception as e:
            print e
            return {'status': False, 'error': e}

    return dict(POST=POST)

